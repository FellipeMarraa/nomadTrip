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

    const memberHistory = useMemo(() => {
        if (!viewingMember) return [];
        return settlements
            .filter(s => s.from === viewingMember.uid || s.to === viewingMember.uid)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [viewingMember, settlements]);

    if (!viewingMember) return null;

    return (
        <Dialog open={!!viewingMember} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[94vw] max-w-[500px] rounded-[32px] bg-background border-border/40 p-0 overflow-hidden shadow-2xl">
                <div className="p-6 bg-muted/5 border-b border-border/40">
                    <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-medium uppercase border border-primary/10">
                            {viewingMember.name.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                            <DialogTitle className="text-sm font-medium uppercase tracking-widest">{viewingMember.name}</DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Acertos de contas</p>
                        </div>
                    </DialogHeader>
                </div>

                <Tabs defaultValue="debts" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-border/10 h-12 p-0 rounded-none">
                        <TabsTrigger value="debts" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-none text-[9px] font-medium uppercase tracking-widest transition-all">Deve</TabsTrigger>
                        <TabsTrigger value="credits" className="data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-500 rounded-none text-[9px] font-medium uppercase tracking-widest transition-all">Receber</TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-amber-500/5 data-[state=active]:text-amber-500 rounded-none text-[9px] font-medium uppercase tracking-widest transition-all">Histórico</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-6">
                            <TabsContent value="debts" className="m-0 space-y-8">
                                {debts.length > 0 ? debts.map((group, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-border/10 pb-3">
                                            <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">Pagar para <span className="text-foreground">{group.member.name.split(' ')[0]}</span></span>
                                            <span className="text-sm font-medium text-destructive/80">{formatCurrency(group.netTotal)}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {group.items.map((item, iIdx) => (
                                                <div key={iIdx} className="bg-muted/20 rounded-2xl p-4 border border-border/10 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[11px] font-medium uppercase tracking-tight truncate max-w-[180px]">{item.title}</span>
                                                        <span className="text-[11px] font-medium text-foreground/80">{formatCurrency(item.share)}</span>
                                                    </div>

                                                    <div className="flex flex-col gap-2 pt-3 border-t border-border/5">
                                                        <div className="flex items-center gap-1.5 text-[8px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                                                            <Divide size={10} strokeWidth={1.5} /> {formatCurrency(item.fullAmount)} ÷ {item.participantsCount}p
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays size={10} strokeWidth={1.5} className="text-primary/50" />
                                                                <span className="text-[8px] font-medium text-muted-foreground/60 uppercase">{item.dateLabel}</span>
                                                            </div>
                                                            <div className="flex -space-x-1.5">
                                                                {item.participantsUids.map((pUid: string) => {
                                                                    const participant = trip.members.find(m => m.uid === pUid);
                                                                    return (
                                                                        <div key={pUid} className={cn("h-5 w-5 rounded-full border-2 border-background overflow-hidden flex items-center justify-center text-[6px] font-medium text-white shadow-sm", pUid === viewingMember.uid ? "bg-primary/80" : "bg-muted-foreground/40")}>
                                                                            {participant?.photoURL ? <img src={participant.photoURL} alt="" className="h-full w-full object-cover" /> : <span>{participant?.name.substring(0, 1)}</span>}
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
                                )) : <EmptyState icon={CheckCircle2} label="Sem dívidas pendentes" />}
                            </TabsContent>

                            <TabsContent value="credits" className="m-0 space-y-4">
                                {credits.length > 0 ? credits.map((group, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-medium uppercase text-muted-foreground/60 tracking-wider">Receber de</span>
                                            <span className="text-xs font-medium uppercase text-foreground">{group.member.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-emerald-500/80">{formatCurrency(group.netTotal)}</span>
                                            <Button size="sm" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 h-8 rounded-xl text-[9px] font-medium uppercase tracking-widest border-none shadow-none" onClick={() => onSettle(group.member.uid, viewingMember.uid, group.netTotal)}>
                                                <HandCoins size={14} strokeWidth={1.5} className="mr-1.5" /> Recebi
                                            </Button>
                                        </div>
                                    </div>
                                )) : <EmptyState icon={Receipt} label="Nada a receber no momento" />}
                            </TabsContent>

                            <TabsContent value="history" className="m-0 space-y-3">
                                {memberHistory.length > 0 ? memberHistory.map((s, i) => {
                                    const isPayer = s.from === viewingMember.uid;
                                    return (
                                        <div key={i} className="p-4 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg", isPayer ? "bg-destructive/5 text-destructive/60" : "bg-emerald-500/5 text-emerald-500/60")}>
                                                    {isPayer ? <ArrowUpRight size={14} strokeWidth={1.5} /> : <ArrowDownLeft size={14} strokeWidth={1.5} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-medium uppercase tracking-tight text-foreground/80">
                                                        {isPayer ? `Pagou para ${trip.members.find(m => m.uid === s.to)?.name.split(' ')[0]}` : `Recebeu de ${trip.members.find(m => m.uid === s.from)?.name.split(' ')[0]}`}
                                                    </span>
                                                    <span className="text-[8px] font-medium text-muted-foreground/40 uppercase mt-0.5">{format(parseISO(s.date), "dd MMM 'às' HH:mm", { locale: ptBR })}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={cn("text-[11px] font-medium", isPayer ? "text-destructive/70" : "text-emerald-500/70")}>
                                                    {isPayer ? "-" : "+"}{formatCurrency(s.amount)}
                                                </span>
                                                <div className="h-4 w-4 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-full"><Check size={10} strokeWidth={2.5} /></div>
                                            </div>
                                        </div>
                                    );
                                }) : <EmptyState icon={History} label="Nenhuma transação registrada" />}
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="p-6 bg-muted/5 text-center border-t border-border/5">
                    <Button onClick={onClose} variant="ghost" className="font-medium uppercase text-[10px] tracking-[0.2em] text-muted-foreground/40 hover:text-foreground transition-all">Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EmptyState({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className="py-16 text-center space-y-3">
            <Icon size={24} strokeWidth={1} className="mx-auto text-muted-foreground/20" />
            <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/40">{label}</p>
        </div>
    );
}