import { ArrowRight, CalendarDays, Car, Hotel, Plus, ShoppingBag, Ticket, Utensils, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Trip, TripMember } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberDebtModal } from "@/components/features/MemberDebtModal";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

interface CostsTabProps {
    trip: Trip;
    onAddExpense: (dayNumber?: number) => void;
    onDeleteExpense: (expenseId: string) => void;
    getFormattedDate: (dayNumber: number) => string;
}

const CATEGORY_MAP = {
    FOOD: { label: "Alimentação", icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/10" },
    TRANSPORT: { label: "Transporte", icon: Car, color: "text-blue-500", bg: "bg-blue-500/10" },
    LODGING: { label: "Hospedagem", icon: Hotel, color: "text-purple-500", bg: "bg-purple-500/10" },
    LEISURE: { label: "Lazer", icon: Ticket, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    SHOPPING: { label: "Compras", icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10" },
    OTHER: { label: "Outros", icon: Wallet, color: "text-slate-500", bg: "bg-slate-500/10" },
};

export function CostsTab({ trip, onAddExpense, onDeleteExpense, getFormattedDate }: CostsTabProps) {
    const [selectedDay, setSelectedDay] = useState<string>("1");
    const [viewingMember, setViewingMember] = useState<TripMember | null>(null);

    const expenses = trip.expenses || [];
    const itinerary = trip.itinerary || [];
    const settlements = trip.settlements || [];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // 1. Cálculo de Balanço Líquido (Gastos - Pagamentos/Settlements)
    // Dentro da CostsTab.tsx
    const stats = useMemo(() => {
        const balances: Record<string, number> = {};
        const originalDebts: Record<string, number> = {}; // Para saber quem REALMENTE deve

        trip.members.forEach(m => {
            balances[m.uid] = 0;
            originalDebts[m.uid] = 0;
        });

        // 1. Calcula dívidas brutas
        expenses.forEach(exp => {
            const amount = Number(exp.amount) || 0;
            const participants = exp.participants || [];
            const share = amount / (participants.length || 1);

            participants.forEach(pUid => {
                if (pUid !== exp.paidBy) {
                    balances[pUid] -= share;
                    balances[exp.paidBy] += share;
                    originalDebts[pUid] -= share; // Guarda a dívida real
                }
            });
        });

        // 2. Só aplica o "Recebi" se a dívida original existir
        settlements.forEach(settle => {
            // Se a dívida original de quem pagou sumiu (porque a despesa foi deletada),
            // a gente ignora esse pagamento no cálculo visual.
            if (Math.abs(originalDebts[settle.from]) > 0.01) {
                balances[settle.from] += settle.amount;
                balances[settle.to] -= settle.amount;
            }
        });

        return balances;
    }, [expenses, trip.members, settlements]);

    const handleSettleDebt = async (from: string, to: string, amount: number) => {
        if (!trip.id) return;
        const settlement = {
            from,
            to,
            amount,
            date: new Date().toISOString()
        };

        await updateDoc(doc(db, "trips", trip.id), {
            settlements: arrayUnion(settlement)
        });
    };

    const filteredExpenses = expenses.filter(e => e.dayNumber === parseInt(selectedDay));

    return (
        <div className="mt-6 space-y-6 animate-in fade-in duration-500">
            {/* CARDS DE RESUMO DE ACERTOS */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                    Acertos da Viagem
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {trip.members.map(member => {
                        const balance = stats[member.uid] || 0;
                        const isDebt = balance < -0.01;
                        const isCredit = balance > 0.01;

                        return (
                            <button
                                key={member.uid}
                                onClick={() => setViewingMember(member)}
                                className="flex items-center justify-between p-3 rounded-2xl border border-border/40 bg-card/40 text-left transition-all hover:border-primary/40 active:scale-95 group"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                                        {member.name.substring(0, 2)}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-[10px] font-bold truncate uppercase leading-none mb-1">{member.name.split(' ')[0]}</span>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded w-fit",
                                            isCredit ? "bg-emerald-500/10 text-emerald-500" : isDebt ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                                        )}>
                                            {isCredit ? "Crédito" : isDebt ? "Dívida" : "Quitado"}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "text-xs font-black shrink-0",
                                    isCredit ? "text-emerald-500" : isDebt ? "text-destructive" : "text-muted-foreground"
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
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Filtrar por data</label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-full h-12 bg-card/40 border-border/40 rounded-xl px-4 text-xs font-bold uppercase tracking-tight focus:ring-0">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={16} className="text-primary" />
                            <SelectValue placeholder="Selecione o dia" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40 rounded-xl">
                        {itinerary.length > 0 ? (
                            itinerary.map((day) => (
                                <SelectItem key={day.dayNumber} value={day.dayNumber.toString()} className="text-xs font-bold uppercase py-3">
                                    {getFormattedDate(day.dayNumber)}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-4 text-[10px] font-bold text-muted-foreground uppercase">Roteiro vazio</div>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* LISTA DE GASTOS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lançamentos do Dia</h3>
                    <Button onClick={() => onAddExpense(parseInt(selectedDay))} size="sm" className="bg-primary text-primary-foreground text-[10px] font-black uppercase h-8 rounded-lg">
                        <Plus size={14} className="mr-1" /> Add Gasto
                    </Button>
                </div>

                <div className="space-y-3">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => {
                            const cat = CATEGORY_MAP[expense.category] || CATEGORY_MAP.OTHER;
                            return (
                                <div key={expense.id} className="group p-4 rounded-2xl border border-border/40 bg-card/30 hover:bg-card/40 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cat.bg, cat.color)}>
                                            <cat.icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-tight truncate">{expense.title}</p>
                                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-bold">
                                                <span>Pago por {trip.members.find(m => m.uid === expense.paidBy)?.name.split(' ')[0]}</span>
                                                <ArrowRight size={8} />
                                                <span>{expense.participants?.length} pessoas</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black tracking-tight">{formatCurrency(expense.amount)}</p>
                                            <button onClick={() => onDeleteExpense(expense.id)} className="text-[9px] text-destructive font-bold uppercase opacity-0 group-hover:opacity-100 transition-all">Excluir</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center border border-dashed border-border/40 rounded-3xl opacity-50">
                            <Wallet size={24} className="mx-auto mb-2 text-muted-foreground/20" />
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Sem lançamentos para este dia</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL COMPONENTIZADO DE DÍVIDAS E CRÉDITOS */}
            <MemberDebtModal
                viewingMember={viewingMember}
                trip={trip}
                onClose={() => setViewingMember(null)}
                onSettle={handleSettleDebt}
            />
        </div>
    );
}