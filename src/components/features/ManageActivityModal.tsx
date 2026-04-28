import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Activity } from "@/types";

interface ManageActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Activity) => Promise<void>;
    editingActivity: Activity | null;
}

// Tipagem rigorosa para alinhar com a interface Activity
type ActivityType = "FOOD" | "CULTURE" | "TRANSPORT" | "LEISURE";

const ACTIVITY_TYPES: { label: string; value: ActivityType }[] = [
    { label: "Alimentação", value: "FOOD" },
    { label: "Cultura", value: "CULTURE" },
    { label: "Transporte", value: "TRANSPORT" },
    { label: "Lazer", value: "LEISURE" },
];

export function ManageActivityModal({ isOpen, onClose, onSave, editingActivity }: ManageActivityModalProps) {
    const [title, setTitle] = useState(editingActivity?.title ?? "");
    const [time, setTime] = useState(editingActivity?.time ?? "");
    const [type, setType] = useState<ActivityType>(editingActivity?.type ?? "LEISURE");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!title || !time) return;
        setLoading(true);
        try {
            await onSave({
                // Se estiver editando, mantemos o ID antigo, senão geramos um novo
                id: editingActivity?.id ?? crypto.randomUUID().substring(0, 8),
                title,
                time,
                type,
            });
            onClose();
        } catch (error) {
            console.error("Erro ao salvar atividade:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border/40 w-[92vw] max-w-[380px] p-5 rounded-2xl gap-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                        {editingActivity ? "Editar Atividade" : "Nova Atividade"}
                    </DialogTitle>
                    <DialogDescription className="text-[11px] text-muted-foreground">
                        Preencha os detalhes do que será feito neste horário.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80">Horário</Label>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-background/40 border-border/40 h-11 rounded-xl focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80">Categoria</Label>
                            <Select
                                value={type}
                                onValueChange={(val: ActivityType) => setType(val)}
                            >
                                <SelectTrigger className="bg-background/40 border-border/40 h-11 rounded-xl focus:ring-primary/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border/40 rounded-xl">
                                    {ACTIVITY_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value} className="text-xs transition-colors focus:bg-primary/10">
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80">O que fazer?</Label>
                        <Input
                            placeholder="Ex: Visita à Torre Eiffel"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-background/40 border-border/40 h-11 rounded-xl focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-row gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-accent/50 transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={loading || !title || !time}
                        onClick={handleConfirm}
                        className="flex-1 bg-primary text-primary-foreground font-bold rounded-xl h-11 text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Confirmar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}