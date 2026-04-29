import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ManageChecklistItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Ajustado para receber o parâmetro opcional isGlobal
    onSave: (task: string, category: string, isGlobal?: boolean) => Promise<void>;
    isOwner: boolean;
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

export function ManageChecklistItemModal({ isOpen, onClose, onSave, isOwner }: ManageChecklistItemModalProps) {
    const [task, setTask] = useState("");
    const [category, setCategory] = useState("Essenciais");
    const [loading, setLoading] = useState(false);
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTask("");
            setCategory("Essenciais");
            setIsGlobal(false); // Reseta para pessoal ao abrir
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!task.trim()) return;
        setLoading(true);
        try {
            // Passa o estado do checkbox/toggle para a função de salvar
            await onSave(task.trim().toUpperCase(), category, isGlobal);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border/40 w-[92vw] max-w-[380px] p-6 rounded-[32px] gap-6 focus:outline-none">
                <DialogHeader>
                    <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-primary">
                        Novo Item de Bagagem
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* INPUT DA TAREFA */}
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">O que levar?</Label>
                        <Input
                            placeholder="Ex: Protetor Solar"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            className="bg-background/40 border-border/40 h-12 rounded-2xl text-xs font-bold uppercase focus-visible:ring-primary/20"
                            autoFocus
                        />
                    </div>

                    {/* SELETOR DE CATEGORIA */}
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Categoria</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-background/40 border-border/40 h-12 rounded-2xl text-xs font-bold uppercase focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border/40 rounded-2xl">
                                {CHECKLIST_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="text-[11px] font-bold uppercase py-3">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* OPÇÃO GLOBAL (Só para o Owner) */}
                    {isOwner && (
                        <div
                            onClick={() => setIsGlobal(!isGlobal)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer mt-2",
                                isGlobal
                                    ? "bg-primary/10 border-primary/40 shadow-sm shadow-primary/5"
                                    : "bg-muted/10 border-border/40 hover:bg-muted/20"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                    isGlobal ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                )}>
                                    {isGlobal ? <Globe size={16} /> : <User size={16} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-tight",
                                        isGlobal ? "text-primary" : "text-foreground"
                                    )}>
                                        {isGlobal ? "Item Global" : "Item Pessoal"}
                                    </span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase leading-none mt-1">
                                        {isGlobal ? "Visível para todos" : "Apenas você verá"}
                                    </span>
                                </div>
                            </div>
                            <div className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                isGlobal ? "border-primary bg-primary" : "border-border/60"
                            )}>
                                {isGlobal && <div className="h-2 w-2 rounded-full bg-white animate-in zoom-in" />}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        disabled={loading || !task.trim()}
                        onClick={handleConfirm}
                        className="w-full bg-primary text-primary-foreground font-black rounded-2xl h-12 text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : (
                            <span className="flex items-center gap-2">
                                ADICIONAR À LISTA
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}