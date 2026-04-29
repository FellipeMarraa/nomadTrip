import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {arrayUnion, deleteDoc, doc, onSnapshot, updateDoc} from "firebase/firestore";
import {db} from "@/config/firebase";
import type {Activity, ChecklistItem, DayPlan, Expense, Trip, TripMember} from "@/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ManageDayModal} from "@/components/features/ManageDayModal";
import {ManageActivityModal} from "@/components/features/ManageActivityModal";
import {Calendar, Check, Eraser, Loader2, MapPin, MoreVertical, RefreshCcw, Trash2, UserPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {addDays, format, parseISO} from "date-fns";
import {ptBR} from "date-fns/locale";
import {cn} from "@/lib/utils";
import {toast} from "sonner";

// Importação das abas
import {ItineraryTab} from "./tabs/ItineraryTab";
import {ChecklistTab} from "./tabs/ChecklistTab";
import {CostsTab} from "@/pages/app/tabs/CostsTab.tsx";
import {MembersTab} from "./tabs/MembersTab";
import {ManageExpenseModal} from "@/components/features/ManageExpenseModal.tsx";
import {useAuthStore} from "@/store/useAuthStore.ts";
import {useTripStore} from "@/store/useTripStore";

export function TripDetails() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuthStore();
    const navigate = useNavigate();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [editingDay, setEditingDay] = useState<DayPlan | null>(null);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<{ activity: Activity, index: number } | null>(null);
    const [activeDayForActivity, setActiveDayForActivity] = useState<number | null>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const isOwner = trip?.ownerId === user?.uid;

    useEffect(() => {
        if (!id || authLoading) return;

        const unsubscribe = onSnapshot(
            doc(db, "trips", id),
            (docSnap) => {
                if (docSnap.exists()) {
                    setTrip({ ...docSnap.data(), id: docSnap.id } as Trip);
                } else {
                    toast.error("Viagem não encontrada.");
                    navigate("/dashboard");
                }
                setLoading(false);
            },
            () => {
                toast.error("Acesso negado.");
                navigate("/dashboard");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [id, navigate, authLoading]);

    useEffect(() => {
        if (!id) { setLoading(false); return; }
        const unsubscribe = onSnapshot(doc(db, "trips", id), (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ ...docSnap.data(), id: docSnap.id } as Trip);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    const getFormattedDate = (dayNumber: number) => {
        if (!trip?.startDate) return `Dia ${dayNumber}`;
        return format(addDays(parseISO(trip.startDate), dayNumber - 1), "dd 'de' MMMM", { locale: ptBR });
    };

    // --- HANDLER DE IA (REGENERAÇÃO) ---
    const handleResetWithAI = async () => {
        if (!id || !trip) return;

        try {
            // 1. Inicia o loading visual
            await updateDoc(doc(db, "trips", id), {
                status: 'START' // O ItineraryTab usa isso para mostrar o loading
            });

            const startDate = parseISO(trip.startDate);
            const endDate = parseISO(trip.endDate);
            const diffDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const tripContext = {
                destination: trip.destination,
                totalDays: diffDays,
                tripType: trip.aiMetadata?.tripType || 'SINGLE',
                arrival: trip.aiMetadata?.arrival || { time: "12:00", location: "" },
                departure: trip.aiMetadata?.departure || { time: "12:00", location: "" },
                hotel: trip.aiMetadata?.hotel || ""
            };

            // 2. Chama a Store
            await useTripStore.getState().generateTripAIContent(id, tripContext);

            toast.success("Roteiro regenerado!");
        } catch (error) {
            console.error("Erro na regeneração:", error);
            toast.error("A IA falhou em responder.");

            // 3. SE FALHAR: Forçamos o status de volta para MANUAL
            // para o botão e o loading sumirem
            await updateDoc(doc(db, "trips", id), { status: 'MANUAL' });
        }
    };

    // --- HANDLERS DE GESTÃO ---
    const handleInvite = async () => {
        const inviteUrl = `${window.location.origin}/join/${id}`;
        const inviteText = `Bora viajar comigo para ${trip?.destination}?`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Convite', text: inviteText, url: inviteUrl }); } catch {}
        } else {
            await navigator.clipboard.writeText(`${inviteText} ${inviteUrl}`);
            setCopied(true);
            toast.success("Link copiado!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDeleteTrip = async () => {
        if (!id) return;
        await deleteDoc(doc(db, "trips", id));
        navigate("/dashboard");
    };

    const handleLinkMember = async (ghostUid: string, realMember: TripMember) => {
        if (!id || !trip) return;
        const updatedMembers = trip.members.filter(m => m.uid !== ghostUid);
        const updatedExpenses = (trip.expenses || []).map(exp => ({
            ...exp,
            paidBy: exp.paidBy === ghostUid ? realMember.uid : exp.paidBy,
            participants: (exp.participants || []).map(p => p === ghostUid ? realMember.uid : p)
        }));
        await updateDoc(doc(db, "trips", id), { members: updatedMembers, expenses: updatedExpenses });
    };

    const handleClearItinerary = async () => {
        if (!id) return;
        await updateDoc(doc(db, "trips", id), {
            itinerary: [],
            globalChecklist: [],
            status: 'MANUAL'
        });
    };

    const handleSaveExpense = async (data: Omit<Expense, "id">) => {
        if (!id) return;
        await updateDoc(doc(db, "trips", id), { expenses: arrayUnion({ ...data, id: crypto.randomUUID() }) });
    };

    const handleDeleteExpense = async (eid: string) => {
        if (!id || !trip) return;
        await updateDoc(doc(db, "trips", id), { expenses: trip.expenses.filter(e => e.id !== eid) });
    };

    const handleAddGhost = async (name: string) => {
        if (!id) return;
        await updateDoc(doc(db, "trips", id), {
            members: arrayUnion({ uid: `ghost_${crypto.randomUUID()}`, name, role: 'MEMBER', isGhost: true })
        });
    };

    const handleRemoveMember = async (uid: string) => {
        if (!id || !trip) return;
        await updateDoc(doc(db, "trips", id), {
            members: trip.members.filter(m => m.uid !== uid),
            members_ids: (trip.members_ids || []).filter(mId => mId !== uid)
        });
    };

    const handleSaveDay = async (num: number, city: string) => {
        if (!id || !trip) return;
        let newItin = [...(trip.itinerary || [])];
        if (editingDay) newItin = newItin.map(d => d.dayNumber === num ? { ...d, city } : d);
        else newItin.push({ dayNumber: num, city, activities: [] });
        await updateDoc(doc(db, "trips", id), { itinerary: newItin.sort((a, b) => a.dayNumber - b.dayNumber), status: 'MANUAL' });
    };

    const confirmDeleteDay = async (num: number) => {
        if (!id || !trip) return;
        await updateDoc(doc(db, "trips", id), { itinerary: trip.itinerary.filter(d => d.dayNumber !== num) });
    };

    const handleSaveActivity = async (act: Activity) => {
        if (!id || !trip || activeDayForActivity === null) return;
        const newItin = trip.itinerary.map(day => {
            if (day.dayNumber === activeDayForActivity) {
                const acts = [...day.activities];
                if (editingActivity) acts[editingActivity.index] = act;
                else acts.push(act);
                return { ...day, activities: acts.sort((a, b) => (a.time || "").localeCompare(b.time || "")) };
            }
            return day;
        });
        await updateDoc(doc(db, "trips", id), { itinerary: newItin });
    };

    const handleDeleteActivity = async (dayNum: number, idx: number) => {
        if (!id || !trip) return;
        const newItin = trip.itinerary.map(day => day.dayNumber === dayNum ? { ...day, activities: day.activities.filter((_, i) => i !== idx) } : day);
        await updateDoc(doc(db, "trips", id), { itinerary: newItin });
    };

    const handleAddChecklistItem = async (task: string, category: string, isGlobal?: boolean) => {
        if (!id || !user?.uid) return;

        const newItem: ChecklistItem = {
            id: crypto.randomUUID(),
            task: task.toUpperCase(),
            category,
            completed: false,
            userId: isGlobal ? null : user.uid
        };

        try {
            await updateDoc(doc(db, "trips", id), {
                globalChecklist: arrayUnion(newItem)
            });
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            toast.error("Erro ao salvar item no checklist.");
        }
    };

    const handleDeleteChecklistItem = async (kid: string) => {
        if (!id || !trip) return;
        await updateDoc(doc(db, "trips", id), { globalChecklist: trip.globalChecklist.filter(i => i.id !== kid) });
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary/50" size={32} /></div>;
    if (authLoading || (loading && !trip)) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary/50" size={32} />
            </div>
        );
    }

    if (!trip) return null;

    const isMember = trip.members.some(member => member.uid === user?.uid);
    if (!isMember) return null;

    const isGenerating = trip.status === 'START' || trip.status === 'GENERATING';
    const isManualEmpty = trip.status === 'MANUAL' && trip.itinerary.length === 0;

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-20 animate-in fade-in duration-500 px-4 md:px-0 text-foreground">
            <header className="flex items-start justify-between border-b border-border/40 pb-8">
                <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <MapPin size={12} strokeWidth={3} />
                        <span>Roteiro Consolidado</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter md:text-4xl uppercase truncate">{trip.destination}</h1>
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <Calendar size={14} className="text-primary/60" />
                        {format(parseISO(trip.startDate), "dd/MM/yyyy")} — {format(parseISO(trip.endDate), "dd/MM/yyyy")}
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <Button onClick={handleInvite} variant="outline" size="sm" className="h-10 rounded-xl px-4 gap-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        {copied ? <Check size={14} /> : <UserPlus size={14} />}
                        <span className="hidden sm:inline">{copied ? "Copiado!" : "Convidar"}</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full shrink-0"><MoreVertical size={20} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card border-border/40 rounded-xl p-1 shadow-2xl">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <div className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none transition-colors hover:bg-primary/10 hover:text-primary gap-2">
                                        <RefreshCcw size={14} /> Gerar com IA
                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border/40 rounded-2xl">
                                    <AlertDialogHeader><AlertDialogTitle className="font-bold uppercase tracking-tight">Gerar com IA?</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="text-xs font-bold uppercase tracking-widest">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetWithAI} className="bg-primary text-xs font-bold uppercase tracking-widest">Gerar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <div className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none transition-colors hover:bg-accent gap-2">
                                        <Eraser size={14} /> Limpar Roteiro
                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border/40 rounded-2xl">
                                    <AlertDialogHeader><AlertDialogTitle className="font-bold uppercase tracking-tight text-foreground">Limpar Roteiro?</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="text-xs font-bold uppercase tracking-widest">Voltar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearItinerary} className="bg-foreground text-background text-xs font-bold uppercase tracking-widest">Limpar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {isOwner && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none transition-colors hover:bg-destructive hover:text-white text-destructive gap-2">
                                            <Trash2 size={14} /> Excluir Viagem
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-card border-border/40 rounded-2xl">
                                        <AlertDialogHeader><AlertDialogTitle className="font-bold tracking-tight text-foreground">Excluir permanentemente?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-xs font-bold uppercase tracking-widest">Voltar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteTrip} className="bg-destructive text-white text-xs font-bold uppercase tracking-widest">Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <Tabs defaultValue="itinerary" className="w-full">
                <TabsList className={cn("grid w-full bg-muted/30 border border-border/40 p-1 h-11 rounded-xl", isOwner ? "grid-cols-4" : "grid-cols-3")}>
                    <TabsTrigger value="itinerary" className="rounded-lg text-[10px] font-bold uppercase tracking-widest">Roteiro</TabsTrigger>
                    <TabsTrigger value="checklist" className="rounded-lg text-[10px] font-bold uppercase tracking-widest">Checklist</TabsTrigger>
                    <TabsTrigger value="costs" className="rounded-lg text-[10px] font-bold uppercase tracking-widest">Gastos</TabsTrigger>
                    {isOwner && <TabsTrigger value="members" className="rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary">Membros</TabsTrigger>}
                </TabsList>

                <TabsContent value="itinerary" className="outline-none">
                    <ItineraryTab trip={trip} isGenerating={isGenerating} isManualEmpty={isManualEmpty} getFormattedDate={getFormattedDate} onAddDay={() => { setEditingDay(null); setIsDayModalOpen(true); }} onEditDay={(day) => { setEditingDay(day); setIsDayModalOpen(true); }} onDeleteDay={confirmDeleteDay} onAddActivity={(dayNum) => { setEditingActivity(null); setActiveDayForActivity(dayNum); setIsActivityModalOpen(true); }} onEditActivity={(dayNum, act, idx) => { setEditingActivity({ activity: act, index: idx }); setActiveDayForActivity(dayNum); setIsActivityModalOpen(true); }} onDeleteActivity={handleDeleteActivity} />
                </TabsContent>

                <TabsContent value="checklist" className="outline-none">
                    <ChecklistTab
                        checklist={trip.globalChecklist}
                        onToggleItem={async (itemId, current) => {
                            const updated = trip.globalChecklist.map(i =>
                                i.id === itemId ? { ...i, completed: !current } : i
                            );
                            await updateDoc(doc(db, "trips", id!), { globalChecklist: updated });
                        }}
                        onAddItem={handleAddChecklistItem}
                        onDeleteItem={handleDeleteChecklistItem}
                        isOwner={isOwner}
                    />
                </TabsContent>

                <TabsContent value="costs" className="outline-none">
                    <CostsTab trip={trip} onAddExpense={(dayNum) => { setActiveDayForActivity(dayNum || 1); setIsExpenseModalOpen(true); }} onDeleteExpense={handleDeleteExpense} getFormattedDate={getFormattedDate} />
                </TabsContent>

                {isOwner && (
                    <TabsContent value="members" className="outline-none">
                        <MembersTab trip={trip} onAddGhost={handleAddGhost} onRemoveMember={handleRemoveMember} onLinkMember={handleLinkMember} />
                    </TabsContent>
                )}
            </Tabs>

            <ManageDayModal isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)} onSave={handleSaveDay} trip={trip} editingDay={editingDay} />
            <ManageActivityModal key={editingActivity ? `edit-${activeDayForActivity}-${editingActivity.index}` : "new"} isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} onSave={handleSaveActivity} editingActivity={editingActivity?.activity || null} />
            <ManageExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} trip={trip} defaultDay={activeDayForActivity || 1} />
        </div>
    );
}