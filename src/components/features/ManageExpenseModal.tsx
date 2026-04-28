import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Car, CheckCircle2, Hotel, Loader2, ShoppingBag, Ticket, Users, Utensils, Wallet} from "lucide-react";
import {cn} from "@/lib/utils";
import type {Expense, Trip} from "@/types";

interface ManageExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (expense: Omit<Expense, "id">) => Promise<void>;
    trip: Trip | null;
    defaultDay?: number;
}

const CATEGORIES = [
    { id: "FOOD", label: "Alimentação", icon: Utensils },
    { id: "TRANSPORT", label: "Transporte", icon: Car },
    { id: "LODGING", label: "Hospedagem", icon: Hotel },
    { id: "LEISURE", label: "Lazer", icon: Ticket },
    { id: "SHOPPING", label: "Compras", icon: ShoppingBag },
    { id: "OTHER", label: "Outros", icon: Wallet },
] as const;

export function ManageExpenseModal({ isOpen, onClose, onSave, trip, defaultDay }: ManageExpenseModalProps) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [dayNumber, setDayNumber] = useState(1);
    const [paidBy, setPaidBy] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [category, setCategory] = useState<Expense["category"]>("FOOD");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && trip) {
            setTitle("");
            setAmount("");
            setCategory("FOOD");
            setDayNumber(defaultDay || 1);
            setPaidBy(trip.members[0]?.uid || "");
            setParticipants(trip.members.map(m => m.uid));
        }
    }, [isOpen, trip, defaultDay]);

    const toggleParticipant = (uid: string) => {
        setParticipants(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
    };

    const handleSelectAll = () => {
        if (!trip) return;
        if (participants.length === trip.members.length) setParticipants([]);
        else setParticipants(trip.members.map(m => m.uid));
    };

    const handleSave = async () => {
        if (!title || !amount || participants.length === 0 || !paidBy) return;
        setLoading(true);
        try {
            await onSave({
                title,
                amount: Number(amount.replace(",", ".")),
                category,
                dayNumber,
                paidBy,
                participants,
                date: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!trip) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="w-[95vw] max-w-[420px] h-[85vh] rounded-[32px] bg-card border-border/40 p-0 overflow-hidden shadow-2xl flex flex-col focus:outline-none"
            >
                {/* HEADER FIXO */}
                <div className="flex items-center justify-between p-6 border-b border-border/10 shrink-0">
                    <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Novo Gasto
                    </DialogTitle>
                </div>

                {/* ÁREA DE CONTEÚDO COM SCROLL NATIVO (MAIS ESTÁVEL EM MOBILE) */}
                <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                    <div className="space-y-8 pb-10">
                        {/* VALOR */}
                        <div className="space-y-1 text-center py-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Quanto custou?</label>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-2xl font-black text-primary/30 mt-2">R$</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
                                    className="w-full bg-transparent text-center text-5xl font-black tracking-tighter text-primary outline-none placeholder:text-primary/10"
                                />
                            </div>
                        </div>

                        {/* DESCRIÇÃO */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">O que você pagou?</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full rounded-2xl border border-border/40 bg-muted/20 px-5 py-4 text-xs font-bold outline-none uppercase placeholder:opacity-30"
                                placeholder="EX: JANTA, TAXI, AIRBNB..."
                            />
                        </div>

                        {/* QUEM PAGOU (LISTA HORIZONTAL) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Quem pagou?</label>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {trip.members.map(m => (
                                    <button
                                        key={m.uid}
                                        type="button"
                                        onClick={() => setPaidBy(m.uid)}
                                        className="flex flex-col items-center gap-2 shrink-0"
                                    >
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl border-2 flex items-center justify-center transition-all overflow-hidden",
                                            paidBy === m.uid ? "border-primary bg-primary shadow-lg shadow-primary/20 scale-105" : "border-border/40 bg-muted/40"
                                        )}>
                                            {m.photoURL ? (
                                                <img src={m.photoURL} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className={cn("text-xs font-black uppercase", paidBy === m.uid ? "text-primary-foreground" : "text-muted-foreground")}>
                                                    {m.name.substring(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                        <span className={cn("text-[9px] font-black uppercase truncate w-14 text-center", paidBy === m.uid ? "text-primary" : "text-muted-foreground")}>
                                            {m.name.split(' ')[0]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DIVIDIR COM (GRID DE 3) */}
                        <div className="space-y-3 bg-muted/10 p-4 rounded-[28px] border border-border/10">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Users size={12} /> Com quem dividir?
                                </label>
                                <button onClick={handleSelectAll} className="text-[9px] font-black uppercase text-primary px-3 py-1 bg-primary/10 rounded-full">
                                    Todos
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {trip.members.map(m => (
                                    <button
                                        key={m.uid}
                                        type="button"
                                        onClick={() => toggleParticipant(m.uid)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all relative overflow-hidden",
                                            participants.includes(m.uid) ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground opacity-60"
                                        )}
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border/40">
                                            {m.photoURL ? <img src={m.photoURL} className="h-full w-full object-cover" /> : <span className="text-[9px] font-bold">{m.name.substring(0, 1)}</span>}
                                        </div>
                                        <span className="text-[8px] font-black uppercase truncate w-full text-center">{m.name.split(' ')[0]}</span>
                                        {participants.includes(m.uid) && (
                                            <div className="absolute top-1 right-1 text-primary">
                                                <CheckCircle2 size={10} fill="currentColor" className="text-white bg-primary rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CATEGORIAS */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Categoria</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id as Expense["category"])}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/40 p-4 transition-all",
                                            category === cat.id ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/10 text-muted-foreground"
                                        )}
                                    >
                                        <cat.icon size={18} />
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BOTÃO DE SALVAR DENTRO DO SCROLL (PARA NÃO SOBREPOR NADA) */}
                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={loading || !title || !amount || participants.length === 0}
                                className="w-full h-16 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Confirmar Gasto"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}