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
    generateTripAIContent: (tripId: string, context: AIContext) => Promise<void>;
}

export const useTripStore = create<TripState>((set) => ({
    trips: [],
    activeTrip: null,

    setActiveTrip: (trip) => set({ activeTrip: trip }),

    subscribeToTrips: (userId) => {
        // Esta query é o que garante que o usuário só "baixe" as viagens onde ele é membro
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

    async addMember(tripId: string, member: TripMember) {
        const tripRef = doc(db, "trips", tripId);

        await updateDoc(tripRef, {
            members_ids: arrayUnion(member.uid),
            members: arrayUnion(member)
        });
    },

    createTrip: async (tripData) => {
        try {
            // Garantimos que o criador sempre comece dentro do members_ids
            const docRef = await addDoc(collection(db, 'trips'), {
                ...tripData,
                createdAt: serverTimestamp(),
                members_ids: [tripData.ownerId], // Segurança: Dono é o primeiro ID
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
        const tripRef = doc(db, 'trips', tripId);
        try {
            await updateDoc(tripRef, { status: 'GENERATING' });

            const aiData = await generateTripContent(context);

            if (!aiData) throw new Error("IA não retornou dados.");

            // Mapeamento para o formato ChecklistItem (userId: null para itens globais)
            const checklist = (aiData.checklist || []).map((item: any) => ({
                id: crypto.randomUUID().substring(0, 8),
                task: item.task.toUpperCase(),
                category: item.category || "Geral",
                completed: false,
                userId: null // Itens gerados pela IA são globais por padrão
            }));

            const itinerary = (aiData.itinerary || []).map((day: any) => ({
                dayNumber: day.dayNumber,
                city: day.city || context.destination.split(',')[0].trim(),
                activities: (day.activities || []).map((act: any) => ({
                    id: crypto.randomUUID().substring(0, 8), // Adicionado ID para facilitar edição
                    time: act.time || "09:00",
                    title: act.title.toUpperCase(),
                    type: "LEISURE",
                    iconId: "MapPin" // Ícone padrão para atividades da IA
                }))
            }));

            await updateDoc(tripRef, {
                globalChecklist: checklist,
                itinerary: itinerary,
                status: 'COMPLETED'
            });

        } catch (err) {
            console.error("Erro crítico na geração da IA:", err);
            // Em caso de erro, voltamos para 'MANUAL' para não travar a tela do usuário no loading
            await updateDoc(tripRef, {
                status: 'MANUAL'
            });
            throw err;
        }
    }
}));