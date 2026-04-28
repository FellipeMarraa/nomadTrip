import { create } from 'zustand';
import { db } from '@/config/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import type { Trip, TripMember, AIContext } from '@/types';
import { generateTripContent } from "@/services/aiService.ts";

interface TripState {
    trips: Trip[];
    activeTrip: Trip | null;
    subscribeToTrips: (userId: string) => () => void;
    setActiveTrip: (trip: Trip | null) => void;
    addMember: (tripId: string, member: TripMember) => Promise<void>;
    createTrip: (tripData: any) => Promise<string>;
    // Atualizado para receber o contexto completo
    generateTripAIContent: (tripId: string, context: AIContext) => Promise<void>;
}

export const useTripStore = create<TripState>((set) => ({
    trips: [],
    activeTrip: null,

    setActiveTrip: (trip) => set({ activeTrip: trip }),

    subscribeToTrips: (userId) => {
        const q = query(
            collection(db, 'trips'),
            where('members_ids', 'array-contains', userId)
        );

        return onSnapshot(q, (snapshot) => {
            const tripsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Trip[];
            set({ trips: tripsData });
        });
    },

    addMember: async (tripId, member) => {
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
            members: arrayUnion(member),
            members_ids: arrayUnion(member.uid)
        });
    },

    createTrip: async (tripData) => {
        try {
            const docRef = await addDoc(collection(db, 'trips'), {
                ...tripData,
                createdAt: serverTimestamp(),
                members_ids: [tripData.ownerId],
                globalChecklist: tripData.globalChecklist || [],
                itinerary: [],
                expenses: [],
                status: tripData.status || 'START'
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao criar viagem:", error);
            throw error;
        }
    },

    generateTripAIContent: async (tripId, context) => {
        try {
            const tripRef = doc(db, 'trips', tripId);

            // Atualiza status para sinalizar que a IA começou
            await updateDoc(tripRef, { status: 'GENERATING' });

            console.log("IA Iniciada com contexto logístico:", context);

            // Chama o serviço enviando o objeto de contexto completo
            const aiData = await generateTripContent(context);

            if (!aiData) throw new Error("IA não retornou dados.");

            // Sanitização final antes do Firebase
            const checklist = (aiData.checklist || []).map((item: any) => ({
                id: crypto.randomUUID().substring(0, 8),
                task: item.task || "Tarefa sugerida",
                category: item.category || "Geral",
                completed: false
            }));

            const itinerary = (aiData.itinerary || []).map((day: any) => ({
                dayNumber: day.dayNumber,
                city: day.city || context.destination.split(',')[0].trim(),
                activities: (day.activities || []).map((act: any) => ({
                    time: act.time || "09:00",
                    title: act.title || "Atividade",
                    type: act.type || "LEISURE"
                }))
            }));

            await updateDoc(tripRef, {
                globalChecklist: checklist,
                itinerary: itinerary,
                status: 'COMPLETED' // IA finalizou com sucesso
            });

            console.log("IA finalizou e salvou os dados!");
        } catch (err) {
            console.error("Erro crítico na geração da IA:", err);
            const tripRef = doc(db, 'trips', tripId);
            await updateDoc(tripRef, {
                itinerary: [],
                status: 'MANUAL' // Em caso de erro, libera para o usuário fazer manual
            });
        }
    }
}));