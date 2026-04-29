import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {arrayUnion, deleteDoc, doc, onSnapshot, updateDoc} from "firebase/firestore";
import {db} from "@/config/firebase";
import type {Activity, ChecklistItem, DayPlan, Expense, Trip, TripMember} from "@/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ManageDayModal} from "@/components/features/ManageDayModal";
import {ManageActivityModal} from "@/components/features/ManageActivityModal";
import {
    Calendar,
    Check,
    Eraser,
    Loader2,
    LogOut,
    MapPin,
    MoreVertical,
    RefreshCcw,
    Share2,
    Shield,
    Trash2
} from "lucide-react";
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

    const isOwner = !!trip?.ownerIds?.includes(user?.uid || "");

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

    const handleInviteAdmin = async () => {
        const inviteUrl = `${window.location.origin}/join/${id}?role=admin`;
        const inviteText = `Convite de administrador para a viagem em ${trip?.destination}:`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Convite Admin', text: inviteText, url: inviteUrl });
            } catch {}
        } else {
            await navigator.clipboard.writeText(`${inviteText} ${inviteUrl}`);
            toast.success("Link de Admin copiado!");
        }
    };

    const handleLeaveTrip = async () => {
        if (!id || !user || !trip) return;

        try {
            const updatedMembers = trip.members.filter(m => m.uid !== user.uid);
            const updatedIds = (trip.members_ids || []).filter(uid => uid !== user.uid);
            const updatedChecklist = (trip.globalChecklist || []).filter(item => item.userId !== user.uid);

            await updateDoc(doc(db, "trips", id), {
                members: updatedMembers,
                members_ids: updatedIds,
                globalChecklist: updatedChecklist
            });

            toast.success("Você saiu da viagem.");
            navigate("/dashboard");
        } catch (error) {
            toast.error("Erro ao sair da viagem.");
        }
    };

    const getFormattedDate = (dayNumber: number) => {
        if (!trip?.startDate) return `Dia ${dayNumber}`;
        return format(addDays(parseISO(trip.startDate), dayNumber - 1), "dd 'de' MMMM", { locale: ptBR });
    };

    const handleResetWithAI = async () => {
        if (!id || !trip) return;
        try {
            await updateDoc(doc(db, "trips", id), { status: 'START' });
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

            await useTripStore.getState().generateTripAIContent(id, tripContext);
            toast.success("Roteiro regenerado!");
        } catch (error) {
            toast.error("A IA falhou em responder.");
            await updateDoc(doc(db, "trips", id), { status: 'MANUAL' });
        }
    };

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
        try {
            const updatedMembers = trip.members.filter(m => m.uid !== uid);
            const updatedIds = (trip.members_ids || []).filter(mId => mId !== uid);
            const updatedChecklist = (trip.globalChecklist || []).filter(item => item.userId !== uid);
            await updateDoc(doc(db, "trips", id), {
                members: updatedMembers,
                members_ids: updatedIds,
                globalChecklist: updatedChecklist
            });
            toast.success("Membro removido.");
        } catch (error) {
            toast.error("Erro ao remover membro.");
        }
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
            await updateDoc(doc(db, "trips", id), { globalChecklist: arrayUnion(newItem) });
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
        }
    };

    const handleDeleteChecklistItem = async (kid: string) => {
        if (!id || !trip) return;
        await updateDoc(doc(db, "trips", id), { globalChecklist: trip.globalChecklist.filter(i => i.id !== kid) });
    };

    if (loading || authLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary/30" size={32} strokeWidth={1.5} /></div>;
    if (!trip) return null;

    const isMember = trip.members.some(member => member.uid === user?.uid);
    if (!isMember) return null;

    const isGenerating = trip.status === 'START' || trip.status === 'GENERATING';
    const isManualEmpty = trip.status === 'MANUAL' && trip.itinerary.length === 0;

    return (
        <div className="mx-auto max-w-5xl space-y-10 pb-20 animate-in fade-in duration-700 px-4 md:px-0">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-primary/70">
                        <MapPin size={14} strokeWidth={1.5} />
                        <span>Roteiro de viagem para</span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-5xl text-foreground">
                        {trip.destination}
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60 tracking-wider">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} strokeWidth={1.5} className="text-primary/40" />
                            <span>{format(parseISO(trip.startDate), "dd MMM", {locale: ptBR})} — {format(parseISO(trip.endDate), "dd MMM yyyy", {locale: ptBR})}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isOwner ? (
                        <>
                            <Button onClick={handleInvite} variant="secondary" size="sm"
                                    className="h-10 rounded-2xl px-5 gap-2 bg-primary/5 text-primary hover:bg-primary/10 transition-all text-[11px] font-medium uppercase tracking-wider border-none">
                                {copied ? <Check size={15} strokeWidth={2}/> : <Share2 size={15} strokeWidth={1.5}/>}
                                <span>{copied ? "Copiado" : "Convidar"}</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <MoreVertical size={18} strokeWidth={1.5}/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border/40 rounded-2xl p-2 shadow-xl shadow-black/5">
                                    <div
                                        onClick={handleInviteAdmin}
                                        className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider hover:bg-amber-500/10 hover:text-amber-600 gap-3 transition-colors text-amber-600/80"
                                    >
                                        <Shield size={14} strokeWidth={1.5} />
                                        Convidar Co-Admin
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <div className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider hover:bg-primary/5 hover:text-primary gap-3 transition-colors">
                                                <RefreshCcw size={14} strokeWidth={1.5}/> Re-gerar com IA
                                            </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-3xl border-border/40">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="font-semibold tracking-tight text-xl">Novo roteiro com IA?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl border-none bg-muted/50 text-xs font-medium uppercase tracking-wider">Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleResetWithAI} className="rounded-xl bg-primary text-xs font-medium uppercase tracking-wider">Confirmar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <div className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider hover:bg-accent gap-3 transition-colors">
                                                <Eraser size={14} strokeWidth={1.5}/> Limpar Dados
                                            </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-3xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="font-semibold tracking-tight">Limpar este roteiro?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl border-none bg-muted/50">Voltar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleClearItinerary} className="rounded-xl bg-foreground text-background font-medium uppercase text-[10px] tracking-widest">Limpar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <div className="h-px bg-border/20 my-2" />

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <div className="flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider hover:bg-destructive/5 text-destructive gap-3 transition-colors">
                                                <Trash2 size={14} strokeWidth={1.5}/> Excluir Viagem
                                            </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-3xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="font-semibold tracking-tight">Excluir permanentemente?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl border-none bg-muted/50">Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteTrip} className="rounded-xl bg-destructive text-white font-medium uppercase text-[10px] tracking-widest">Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 rounded-2xl px-6 gap-2 border-destructive/20 text-destructive text-[11px] font-medium uppercase tracking-wider hover:bg-destructive/5 transition-all">
                                    <LogOut size={14} strokeWidth={1.5} />
                                    <span>Sair</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-semibold tracking-tight">Deixar esta viagem?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl border-none bg-muted/50">Ficar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLeaveTrip} className="rounded-xl bg-destructive text-white font-medium uppercase text-[10px] tracking-widest">Confirmar Saída</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </header>

            <Tabs defaultValue="itinerary" className="w-full">
                <TabsList className={cn("grid w-full bg-muted/20 border-none p-1 h-12 rounded-2xl mb-8", isOwner ? "grid-cols-4" : "grid-cols-3")}>
                    <TabsTrigger value="itinerary" className="rounded-xl text-[10px] font-medium uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Roteiro</TabsTrigger>
                    <TabsTrigger value="checklist" className="rounded-xl text-[10px] font-medium uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Checklist</TabsTrigger>
                    <TabsTrigger value="costs" className="rounded-xl text-[10px] font-medium uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Finanças</TabsTrigger>
                    {isOwner && <TabsTrigger value="members" className="rounded-xl text-[10px] font-medium uppercase tracking-[0.15em] data-[state=active]:bg-background data-[state=active]:shadow-sm text-primary transition-all">Membros</TabsTrigger>}
                </TabsList>

                <TabsContent value="itinerary" className="outline-none focus:ring-0">
                    <ItineraryTab trip={trip} isGenerating={isGenerating} isManualEmpty={isManualEmpty} getFormattedDate={getFormattedDate} isOwner={isOwner} onAddDay={() => { setEditingDay(null); setIsDayModalOpen(true); }} onEditDay={(day) => { setEditingDay(day); setIsDayModalOpen(true); }} onDeleteDay={confirmDeleteDay} onAddActivity={(dayNum) => { setEditingActivity(null); setActiveDayForActivity(dayNum); setIsActivityModalOpen(true); }} onEditActivity={(dayNum, act, idx) => { setEditingActivity({ activity: act, index: idx }); setActiveDayForActivity(dayNum); setIsActivityModalOpen(true); }} onDeleteActivity={handleDeleteActivity} />
                </TabsContent>

                <TabsContent value="checklist" className="outline-none focus:ring-0">
                    <ChecklistTab
                        checklist={trip.globalChecklist}
                        onToggleItem={async (itemId, current) => {
                            const updated = trip.globalChecklist.map(i => i.id === itemId ? { ...i, completed: !current } : i);
                            await updateDoc(doc(db, "trips", id!), { globalChecklist: updated });
                        }}
                        onAddItem={handleAddChecklistItem}
                        onDeleteItem={handleDeleteChecklistItem}
                        isOwner={isOwner}
                    />
                </TabsContent>

                <TabsContent value="costs" className="outline-none focus:ring-0">
                    <CostsTab trip={trip} isOwner={isOwner} onAddExpense={(dayNum) => { setActiveDayForActivity(dayNum || 1); setIsExpenseModalOpen(true); }} onDeleteExpense={handleDeleteExpense} getFormattedDate={getFormattedDate} />
                </TabsContent>

                {isOwner && (
                    <TabsContent value="members" className="outline-none focus:ring-0">
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