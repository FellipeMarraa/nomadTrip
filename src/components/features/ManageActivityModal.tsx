import {useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
    Camera,
    Car,
    CheckCircle2,
    Clock,
    Coffee,
    Edit3,
    Hotel,
    Loader2,
    MapPin,
    Palmtree,
    PlaneLanding,
    ShoppingBag,
    Ticket,
    TrainFront,
    Utensils,
    Wine
} from "lucide-react";
import {cn} from "@/lib/utils";
import type {Activity} from "@/types";

const AVAILABLE_ICONS = [
    { id: "MapPin", icon: MapPin, label: "Geral" },
    { id: "PlaneLanding", icon: PlaneLanding, label: "Voo" },
    { id: "Hotel", icon: Hotel, label: "Hotel" },
    { id: "Palmtree", icon: Palmtree, label: "Praia" }, // Ícone de Praia adicionado
    { id: "Utensils", icon: Utensils, label: "Refeição" },
    { id: "Coffee", icon: Coffee, label: "Café" },
    { id: "Wine", icon: Wine, label: "Bar" },
    { id: "Ticket", icon: Ticket, label: "Atração" },
    { id: "Camera", icon: Camera, label: "Tour" },
    { id: "ShoppingBag", icon: ShoppingBag, label: "Compras" },
    { id: "Car", icon: Car, label: "Carro" },
    { id: "TrainFront", icon: TrainFront, label: "Trem" },
] as const;

export type ActivityIconId = (typeof AVAILABLE_ICONS)[number]["id"];

interface ManageActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Activity) => Promise<void>;
    editingActivity: Activity | null;
}

export function ManageActivityModal({ isOpen, onClose, onSave, editingActivity }: ManageActivityModalProps) {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [selectedIconId, setSelectedIconId] = useState<ActivityIconId>("MapPin");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(editingActivity?.title ?? "");
            setTime(editingActivity?.time ?? "");
            setSelectedIconId((editingActivity as any)?.iconId ?? "MapPin");
        }
    }, [isOpen, editingActivity]);

    const handleConfirm = async () => {
        if (!title || !time) return;
        setLoading(true);
        try {
            await onSave({
                id: editingActivity?.id ?? crypto.randomUUID().substring(0, 8),
                title: title.toUpperCase(),
                time,
                type: "LEISURE",
                iconId: selectedIconId,
            } as any);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card border-border/40 w-[94vw] max-w-[400px] p-0 rounded-[32px] overflow-hidden shadow-2xl flex flex-col focus:outline-none">
                <div className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-center text-primary">
                            {editingActivity ? "Editar Atividade" : "Nova Atividade"}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] text-muted-foreground uppercase font-bold text-center tracking-tight">
                            Personalize o ícone e horário
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* SELETOR DE ÍCONES - AJUSTADO PARA NÃO CORTAR */}
                        <div className="space-y-3 bg-muted/10 p-4 rounded-[28px] border border-border/10">
                            <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1 flex items-center gap-2">
                                <MapPin size={12} className="text-primary" /> Ícone da Atividade
                            </Label>

                            {/* Aumentamos o h do ScrollArea e adicionamos py-2 para dar "respiro" ao scale-105 */}
                            <ScrollArea className="w-full">
                                <div className="flex gap-3 px-1 py-3">
                                    {AVAILABLE_ICONS.map((item) => {
                                        const IconComponent = item.icon;
                                        const isSelected = selectedIconId === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setSelectedIconId(item.id)}
                                                className="flex flex-col items-center gap-2 shrink-0 transition-transform active:scale-90"
                                            >
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all relative",
                                                    isSelected
                                                        ? "border-primary bg-primary shadow-lg shadow-primary/20 scale-110 z-10"
                                                        : "border-border/40 bg-muted/40 hover:border-primary/50"
                                                )}>
                                                    <IconComponent
                                                        size={20}
                                                        className={cn(isSelected ? "text-primary-foreground" : "text-muted-foreground")}
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute -top-2 -right-2 bg-background rounded-full p-0.5 border border-primary shadow-sm">
                                                            <CheckCircle2 size={12} fill="currentColor" className="text-white bg-primary rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-tight w-12 truncate text-center",
                                                    isSelected ? "text-primary" : "text-muted-foreground/60"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <ScrollBar orientation="horizontal" className="h-1.5" />
                            </ScrollArea>
                        </div>

                        {/* HORÁRIO */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1 flex items-center gap-2">
                                <Clock size={12} className="text-primary" /> Horário
                            </Label>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-background/40 border-border/40 h-14 rounded-2xl focus-visible:ring-primary/20 text-sm font-bold shadow-inner"
                            />
                        </div>

                        {/* DESCRIÇÃO */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground ml-1 flex items-center gap-2">
                                <Edit3 size={12} className="text-primary" /> O que fazer?
                            </Label>
                            <textarea
                                placeholder="EX: CHECK-IN NO HOTEL"
                                value={title}
                                onChange={(e) => setTitle(e.target.value.toUpperCase())}
                                className="w-full min-h-[100px] p-4 bg-background/40 border border-border/40 rounded-2xl focus:border-primary/50 outline-none text-xs font-bold uppercase resize-none placeholder:text-muted-foreground/30 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row gap-3 p-6 bg-muted/5 border-t border-border/40 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest hover:bg-accent/50 transition-all active:scale-95"
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={loading || !title || !time}
                        onClick={handleConfirm}
                        className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-12 text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirmar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}