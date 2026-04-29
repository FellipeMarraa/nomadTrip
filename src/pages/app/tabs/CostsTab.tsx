import {ArrowRight, CalendarDays, Car, Hotel, Plus, ShoppingBag, Ticket, Utensils, Wallet} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useMemo, useState} from "react";
import {cn} from "@/lib/utils";
import type {Trip, TripMember} from "@/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {MemberDebtModal} from "@/components/features/MemberDebtModal";
import {arrayUnion, doc, updateDoc} from "firebase/firestore";
import {db} from "@/config/firebase";
import {useAuthStore} from "@/store/useAuthStore"; // Importado para verificar o user logado

interface CostsTabProps {
    trip: Trip;
    onAddExpense: (dayNumber?: number) => void;
    onDeleteExpense: (expenseId: string) => void;
    getFormattedDate: (dayNumber: number) => string;
    isOwner: boolean;
}

const CATEGORY_MAP = {
    FOOD: { label: "Alimentação", icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/5" },
    TRANSPORT: { label: "Transporte", icon: Car, color: "text-blue-500", bg: "bg-blue-500/5" },
    LODGING: { label: "Hospedagem", icon: Hotel, color: "text-purple-500", bg: "bg-purple-500/5" },
    LEISURE: { label: "Lazer", icon: Ticket, color: "text-emerald-500", bg: "bg-emerald-500/5" },
    SHOPPING: { label: "Compras", icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/5" },
    OTHER: { label: "Outros", icon: Wallet, color: "text-slate-500", bg: "bg-slate-500/5" },
};

export function CostsTab({ trip, onAddExpense, onDeleteExpense, getFormattedDate, isOwner }: CostsTabProps) {
    const { user } = useAuthStore(); // Usuário logado
    const [selectedDay, setSelectedDay] = useState<string>("1");
    const [viewingMember, setViewingMember] = useState<TripMember | null>(null);

    const expenses = trip.expenses || [];
    const itinerary = trip.itinerary || [];
    const settlements = trip.settlements || [];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const uniqueMembers = useMemo(() => {
        const seen = new Set();
        return trip.members.filter(member => {
            const duplicate = seen.has(member.uid);
            seen.add(member.uid);
            return !duplicate;
        });
    }, [trip.members]);

    const stats = useMemo(() => {
        const balances: Record<string, number> = {};
        trip.members.forEach(m => balances[m.uid] = 0);

        expenses.forEach(exp => {
            const amount = Number(exp.amount) || 0;
            const participants = exp.participants || [];
            const share = amount / (participants.length || 1);

            participants.forEach(pUid => {
                if (pUid !== exp.paidBy) {
                    balances[pUid] -= share;
                    balances[exp.paidBy] += share;
                }
            });
        });

        settlements.forEach(settle => {
            balances[settle.from] += settle.amount;
            balances[settle.to] -= settle.amount;
        });

        return balances;
    }, [expenses, trip.members, settlements]);

    const handleSettleDebt = async (from: string, to: string, amount: number) => {
        if (!trip.id) return;
        const settlement = { from, to, amount, date: new Date().toISOString() };
        await updateDoc(doc(db, "trips", trip.id), { settlements: arrayUnion(settlement) });
    };

    const filteredExpenses = expenses.filter(e => e.dayNumber === parseInt(selectedDay));

    return (
        <div className="mt-6 space-y-8 animate-in fade-in duration-500 px-1">
            {/* CARDS DE RESUMO DE ACERTOS */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground px-1">
                    Acertos da Viagem
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {uniqueMembers
                        .filter(member => isOwner || member.uid === user?.uid) // O FILTRO MÁGICO AQUI
                        .map(member => {
                            const balance = stats[member.uid] || 0;
                        const isDebt = balance < -0.01;
                        const isCredit = balance > 0.01;

                        // REGRA DE ACESSO: Admin vê tudo, Membro só vê o dele
                        const canViewDetails = isOwner || member.uid === user?.uid;

                        return (
                            <button
                                key={member.uid}
                                disabled={!canViewDetails}
                                onClick={() => setViewingMember(member)}
                                className={cn(
                                    "flex flex-col min-h-[110px] p-4 rounded-[28px] border border-border/40 bg-card/30 text-left transition-all shadow-sm",
                                    canViewDetails
                                        ? "hover:border-primary/30 hover:bg-card/50 active:scale-[0.98] cursor-pointer"
                                        : "cursor-default opacity-80"
                                )}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden border border-border/20">
                                        {member.photoURL ? (
                                            <img src={member.photoURL} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-medium text-primary uppercase">
                                                {member.name.substring(0, 2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-[10px] font-medium uppercase tracking-tight text-foreground/90 leading-tight truncate">
                                            {member.name}
                                        </span>
                                        <span className={cn(
                                            "text-[8px] font-medium uppercase px-2 py-0.5 rounded-lg w-fit mt-2 tracking-wider",
                                            isCredit ? "bg-emerald-500/10 text-emerald-500" : isDebt ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground/60"
                                        )}>
                                            {isCredit ? "Crédito" : isDebt ? "Dívida" : "Quitado"}
                                        </span>
                                    </div>
                                </div>

                                <div className={cn(
                                    "text-sm font-medium tracking-tight mt-auto border-t border-border/5 pt-3 w-full flex justify-end",
                                    isCredit ? "text-emerald-500" : isDebt ? "text-destructive" : "text-muted-foreground/30"
                                )}>
                                    {formatCurrency(Math.abs(balance))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SELETOR DE DIAS */}
            <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground px-1">Filtrar por data</label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-full h-12 bg-card/20 border-border/40 rounded-2xl px-4 text-xs font-medium focus:ring-0">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={16} strokeWidth={1.5} className="text-primary/60" />
                            <SelectValue placeholder="Selecione o dia" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40 rounded-2xl">
                        {itinerary.length > 0 ? (
                            itinerary.map((day) => (
                                <SelectItem key={day.dayNumber} value={day.dayNumber.toString()} className="text-[11px] font-medium uppercase py-3">
                                    {getFormattedDate(day.dayNumber)}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Roteiro vazio</div>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* LISTA DE GASTOS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Lançamentos</h3>
                    {isOwner && (
                        <Button onClick={() => onAddExpense(parseInt(selectedDay))} size="sm" className="h-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] font-medium uppercase tracking-widest shadow-none">
                            <Plus size={14} strokeWidth={2} className="mr-1" /> Add Gasto
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => {
                            const cat = CATEGORY_MAP[expense.category as keyof typeof CATEGORY_MAP] || CATEGORY_MAP.OTHER;
                            const payer = trip.members.find(m => m.uid === expense.paidBy);
                            return (
                                <div key={expense.id} className="group p-4 rounded-[28px] border border-border/40 bg-card/20 hover:bg-card/40 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cat.bg, cat.color)}>
                                            <cat.icon size={18} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium uppercase tracking-tight truncate text-foreground">{expense.title}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-lg">
                                                    {payer?.photoURL && (
                                                        <img src={payer.photoURL} alt="" className="h-3 w-3 rounded-full object-cover" />
                                                    )}
                                                    <span className="text-[8px] font-medium uppercase text-muted-foreground truncate max-w-[60px]">{payer?.name}</span>
                                                </div>
                                                <ArrowRight size={8} className="text-muted-foreground/30" />
                                                <span className="text-[8px] font-medium uppercase text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-lg">{expense.participants?.length} pessoas</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-medium tracking-tight text-foreground">{formatCurrency(expense.amount)}</p>
                                            {isOwner && (
                                                <button onClick={() => onDeleteExpense(expense.id)} className="text-[9px] text-destructive/60 font-medium uppercase opacity-0 group-hover:opacity-100 transition-all hover:text-destructive mt-1">Excluir</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center border-2 border-dashed border-border/10 rounded-[32px] bg-muted/5">
                            <Wallet size={24} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/20" />
                            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/30">Sem gastos hoje</p>
                        </div>
                    )}
                </div>
            </div>

            <MemberDebtModal
                viewingMember={viewingMember}
                trip={trip}
                onClose={() => setViewingMember(null)}
                onSettle={handleSettleDebt}
            />
        </div>
    );
}