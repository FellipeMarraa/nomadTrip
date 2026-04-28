import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Utensils, Car, Hotel, Ticket, ShoppingBag, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Expense, Trip } from "@/types";

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

    // RESET DE ESTADO: Sempre que o modal abre ou fecha
    useEffect(() => {
        if (isOpen && trip) {
            // Se abrir, popula com os valores iniciais/padrão
            setTitle("");
            setAmount("");
            setCategory("FOOD");
            setDayNumber(defaultDay || 1);
            setPaidBy(trip.members[0]?.uid || "");
            setParticipants(trip.members.map(m => m.uid));
        } else {
            // Se fechar, limpa tudo para não "piscar" dados antigos na próxima abertura
            setTitle("");
            setAmount("");
            setPaidBy("");
            setParticipants([]);
        }
    }, [isOpen, trip, defaultDay]);

    const toggleParticipant = (uid: string) => {
        setParticipants(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
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
            <DialogContent className="w-[92vw] max-w-[400px] rounded-3xl bg-card border-border/40 p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black uppercase tracking-widest text-center">Registrar Gasto</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-1 text-center">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Valor R$</label>
                        <input
                            type="text"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
                            className="w-full bg-transparent text-center text-5xl font-black tracking-tighter text-primary outline-none placeholder:text-primary/10"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Descrição</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-xs font-bold outline-none uppercase"
                                placeholder="Ex: Jantar na Orla"
                            />
                        </div>

                        {/* QUEM PAGOU */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Quem pagou?</label>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {trip.members.map(m => (
                                    <button
                                        key={m.uid}
                                        type="button"
                                        onClick={() => setPaidBy(m.uid)}
                                        className={cn(
                                            "flex-shrink-0 px-3 py-2 rounded-lg border text-[9px] font-bold transition-all uppercase tracking-widest",
                                            paidBy === m.uid ? "bg-primary border-primary text-primary-foreground" : "bg-muted/50 border-border/40 text-muted-foreground"
                                        )}
                                    >
                                        {m.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PARTICIPANTES */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Dividir com quem?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {trip.members.map(m => (
                                    <button
                                        key={m.uid}
                                        type="button"
                                        onClick={() => toggleParticipant(m.uid)}
                                        className={cn(
                                            "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                                            participants.includes(m.uid) ? "border-primary bg-primary/5 text-primary" : "border-border/40 text-muted-foreground opacity-60"
                                        )}
                                    >
                                        <span className="text-[10px] font-bold uppercase">{m.name.split(' ')[0]}</span>
                                        {participants.includes(m.uid) && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CATEGORIAS */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Categoria</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id as Expense["category"])}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 p-2 transition-all",
                                            category === cat.id ? "bg-primary/10 border-primary text-primary" : "bg-background/40 text-muted-foreground"
                                        )}
                                    >
                                        <cat.icon size={14} />
                                        <span className="text-[8px] font-bold uppercase tracking-tighter">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading || !title || !amount || participants.length === 0} className="w-full h-12 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="animate-spin" /> : "Salvar Gasto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}