import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarDays,
    Check,
    CheckCircle2,
    Divide,
    HandCoins,
    History,
    Receipt
} from "lucide-react";
import {cn} from "@/lib/utils";
import type {Trip, TripMember} from "@/types";
import {addDays, format, parseISO} from "date-fns";
import {ptBR} from "date-fns/locale";
import {useMemo} from "react";

interface MemberDebtModalProps {
    viewingMember: TripMember | null;
    trip: Trip;
    onClose: () => void;
    onSettle: (from: string, to: string, amount: number) => Promise<void>;
}

export function MemberDebtModal({ viewingMember, trip, onClose, onSettle }: MemberDebtModalProps) {
    const expenses = trip.expenses || [];
    const settlements = trip.settlements || [];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getRealDate = (dayNumber: number) => {
        if (!trip.startDate) return `Dia ${dayNumber}`;
        try {
            const date = addDays(parseISO(trip.startDate), dayNumber - 1);
            return format(date, "dd/MM", { locale: ptBR });
        } catch { return `Dia ${dayNumber}`; }
    };

    // LÓGICA 1: O que o membro selecionado DEVE (Com Participantes)
    const debts = useMemo(() => {
        if (!viewingMember) return [];
        const creditors: Record<string, { member: TripMember, total: number, items: any[] }> = {};

        expenses.forEach(exp => {
            const participants = exp.participants || [];
            if (participants.includes(viewingMember.uid) && exp.paidBy !== viewingMember.uid) {
                const amount = Number(exp.amount) || 0;
                const share = amount / (participants.length || 1);

                if (!creditors[exp.paidBy]) {
                    const m = trip.members.find(member => member.uid === exp.paidBy);
                    if (m) creditors[exp.paidBy] = { member: m, total: 0, items: [] };
                }

                if (creditors[exp.paidBy]) {
                    creditors[exp.paidBy].total += share;
                    creditors[exp.paidBy].items.push({
                        title: exp.title,
                        fullAmount: amount,
                        share: share,
                        dateLabel: getRealDate(exp.dayNumber),
                        participantsUids: participants,
                        participantsCount: participants.length
                    });
                }
            }
        });

        return Object.values(creditors).map(group => {
            const alreadyPaid = settlements
                .filter(s => s.from === viewingMember.uid && s.to === group.member.uid)
                .reduce((acc, s) => acc + s.amount, 0);
            return { ...group, netTotal: group.total - alreadyPaid };
        }).filter(g => g.netTotal > 0.01);
    }, [viewingMember, expenses, trip.members, settlements]);

    // LÓGICA 2: O que o membro selecionado tem a RECEBER
    const credits = useMemo(() => {
        if (!viewingMember) return [];
        const debtors: Record<string, { member: TripMember, total: number }> = {};

        expenses.forEach(exp => {
            if (exp.paidBy === viewingMember.uid) {
                const participants = exp.participants || [];
                const share = (Number(exp.amount) || 0) / (participants.length || 1);

                participants.forEach(pUid => {
                    if (pUid !== viewingMember.uid) {
                        if (!debtors[pUid]) {
                            const m = trip.members.find(member => member.uid === pUid);
                            if (m) debtors[pUid] = { member: m, total: 0 };
                        }
                        if (debtors[pUid]) debtors[pUid].total += share;
                    }
                });
            }
        });

        return Object.values(debtors).map(group => {
            const alreadyReceived = settlements
                .filter(s => s.from === group.member.uid && s.to === viewingMember.uid)
                .reduce((acc, s) => acc + s.amount, 0);
            return { ...group, netTotal: group.total - alreadyReceived };
        }).filter(g => g.netTotal > 0.01);
    }, [viewingMember, expenses, trip.members, settlements]);

    // LÓGICA 3: Histórico Geral do Membro
    const memberHistory = useMemo(() => {
        if (!viewingMember) return [];
        return settlements
            .filter(s => s.from === viewingMember.uid || s.to === viewingMember.uid)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [viewingMember, settlements]);

    if (!viewingMember) return null;

    return (
        <Dialog open={!!viewingMember} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[94vw] max-w-[500px] rounded-[32px] bg-card border-border/40 p-0 overflow-hidden shadow-2xl">
                {/* Header fixo */}
                <div className="p-6 bg-primary/5 border-b border-border/40">
                    <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-black uppercase">
                            {viewingMember.name.substring(0, 2)}
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-black uppercase tracking-widest">{viewingMember.name}</DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Relatório de Acertos</p>
                        </div>
                    </DialogHeader>
                </div>

                <Tabs defaultValue="debts" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-border/20 h-12 p-0 rounded-none">
                        <TabsTrigger value="debts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-[9px] font-black uppercase">Deve</TabsTrigger>
                        <TabsTrigger value="credits" className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none text-[9px] font-black uppercase">Receber</TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none text-[9px] font-black uppercase">Histórico</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-6">
                            {/* ABA DE DÍVIDAS COM DETALHAMENTO E BOLINHAS */}
                            <TabsContent value="debts" className="m-0 space-y-8">
                                {debts.length > 0 ? debts.map((group, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground">Pagar para <span className="text-primary">{group.member.name.split(' ')[0]}</span></span>
                                            <span className="text-sm font-black text-destructive">{formatCurrency(group.netTotal)}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {group.items.map((item, iIdx) => (
                                                <div key={iIdx} className="bg-muted/30 rounded-2xl p-4 border border-border/10 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[11px] font-bold uppercase truncate max-w-[180px]">{item.title}</span>
                                                        <span className="text-[11px] font-black">{formatCurrency(item.share)}</span>
                                                    </div>

                                                    <div className="flex flex-col gap-2 pt-2 border-t border-border/10">
                                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted-foreground uppercase">
                                                            <Divide size={10} /> {formatCurrency(item.fullAmount)} ÷ {item.participantsCount}p
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays size={10} className="text-primary" />
                                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">{item.dateLabel}</span>
                                                            </div>
                                                            {/* BOLINHAS DE PARTICIPANTES */}
                                                            <div className="flex -space-x-1.5">
                                                                {item.participantsUids.map((pUid: string) => {
                                                                    const participant = trip.members.find(m => m.uid === pUid);
                                                                    return (
                                                                        <div
                                                                            key={pUid}
                                                                            className={cn(
                                                                                "h-5 w-5 rounded-full border-2 border-card overflow-hidden flex items-center justify-center text-[6px] font-bold text-white uppercase shadow-sm",
                                                                                pUid === viewingMember.uid ? "bg-primary" : "bg-muted-foreground"
                                                                            )}
                                                                            title={participant?.name}
                                                                        >
                                                                            {participant?.photoURL ? (
                                                                                <img
                                                                                    src={participant.photoURL}
                                                                                    alt={participant.name}
                                                                                    className="h-full w-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <span>{participant?.name.substring(0, 1)}</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : <div className="py-12 text-center opacity-40"><CheckCircle2 className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase">Sem dívidas</p></div>}
                            </TabsContent>

                            {/* ABA DE CRÉDITOS */}
                            <TabsContent value="credits" className="m-0 space-y-4">
                                {credits.length > 0 ? credits.map((group, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-muted-foreground">Receber de</span><span className="text-xs font-black uppercase">{group.member.name}</span></div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-emerald-500">{formatCurrency(group.netTotal)}</span>
                                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8 rounded-lg text-[9px] font-black uppercase" onClick={() => onSettle(group.member.uid, viewingMember.uid, group.netTotal)}><HandCoins size={14} className="mr-1" /> Recebi</Button>
                                        </div>
                                    </div>
                                )) : <div className="py-12 text-center opacity-40"><Receipt className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase">Nada a receber</p></div>}
                            </TabsContent>

                            {/* ABA DE HISTÓRICO */}
                            <TabsContent value="history" className="m-0 space-y-3">
                                {memberHistory.length > 0 ? memberHistory.map((s, i) => {
                                    const isPayer = s.from === viewingMember.uid;
                                    return (
                                        <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg", isPayer ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500")}>
                                                    {isPayer ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-tight">
                                                        {isPayer ? `Pagou para ${trip.members.find(m => m.uid === s.to)?.name.split(' ')[0]}` : `Recebeu de ${trip.members.find(m => m.uid === s.from)?.name.split(' ')[0]}`}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{format(parseISO(s.date), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn("text-[11px] font-black", isPayer ? "text-destructive" : "text-emerald-500")}>
                                                    {isPayer ? "-" : "+"}{formatCurrency(s.amount)}
                                                </span>
                                                <div className="bg-emerald-500/20 text-emerald-500 p-0.5 rounded-full"><Check size={8} strokeWidth={4} /></div>
                                            </div>
                                        </div>
                                    );
                                }) : <div className="py-12 text-center opacity-40"><History className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase">Sem histórico</p></div>}
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="p-6 border-t border-border/40 bg-muted/5 text-center">
                    <Button onClick={onClose} variant="ghost" className="font-black uppercase text-[10px] tracking-widest opacity-60 hover:opacity-100">Fechar Relatório</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}