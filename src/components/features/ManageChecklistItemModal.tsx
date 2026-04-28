import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface ManageChecklistItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: string, category: string) => Promise<void>;
}

const CHECKLIST_CATEGORIES = [
    "Essenciais",
    "Roupas",
    "Higiene",
    "Eletrônicos",
    "Documentos",
    "Medicamentos",
    "Outros"
];

export function ManageChecklistItemModal({ isOpen, onClose, onSave }: ManageChecklistItemModalProps) {
    const [task, setTask] = useState("");
    const [category, setCategory] = useState("Essenciais");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTask("");
            setCategory("Essenciais");
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!task.trim()) return;
        setLoading(true);
        try {
            await onSave(task.trim(), category);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border/40 w-[92vw] max-w-[380px] p-6 rounded-[32px] gap-6">
                <DialogHeader>
                    <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] text-center text-muted-foreground">
                        Novo Item de Bagagem
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80 ml-1">O que levar?</Label>
                        <Input
                            placeholder="Ex: Protetor Solar"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            className="bg-background/40 border-border/40 h-12 rounded-xl text-xs font-bold uppercase"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80 ml-1">Categoria</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-background/40 border-border/40 h-12 rounded-xl text-xs font-bold uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border/40 rounded-xl">
                                {CHECKLIST_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="text-[11px] font-bold uppercase py-3">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        disabled={loading || !task.trim()}
                        onClick={handleConfirm}
                        className="w-full bg-primary text-primary-foreground font-black rounded-2xl h-12 text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Adicionar à Lista"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}