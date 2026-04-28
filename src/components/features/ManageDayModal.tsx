import {useEffect, useMemo, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {CalendarOff, Loader2} from "lucide-react";
import {addDays, differenceInDays, format, parseISO} from "date-fns";
import {ptBR} from "date-fns/locale";
import type {DayPlan, Trip} from "@/types";

interface ManageDayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dayNumber: number, city: string) => Promise<void>;
    trip: Trip;
    editingDay: DayPlan | null;
}

export function ManageDayModal({ isOpen, onClose, onSave, trip, editingDay }: ManageDayModalProps) {
    const [newDayNumber, setNewDayNumber] = useState<string>("");
    const [newCity, setNewCity] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingDay) {
            setNewDayNumber(editingDay.dayNumber.toString());
            setNewCity(editingDay.city);
        } else {
            setNewDayNumber("");
            setNewCity("");
        }
    }, [editingDay, isOpen]);

    const availableDayNumbers = useMemo(() => {
        if (!trip.startDate || !trip.endDate) return [];
        const start = parseISO(trip.startDate);
        const end = parseISO(trip.endDate);
        const totalDays = Math.max(differenceInDays(end, start) + 1, 1);

        return Array.from({ length: totalDays }, (_, i) => {
            const num = i + 1;
            const date = addDays(start, i);
            return {
                num,
                label: format(date, "dd/MM '—' EEEE", { locale: ptBR })
            };
        });
    }, [trip.startDate, trip.endDate]);

    const allDaysCreated = useMemo(() => {
        if (editingDay) return false;
        const createdDays = trip.itinerary?.map(d => d.dayNumber) || [];
        return availableDayNumbers.length > 0 && availableDayNumbers.every(day => createdDays.includes(day.num));
    }, [trip.itinerary, availableDayNumbers, editingDay]);

    const handleConfirm = async () => {
        if (!newCity || !newDayNumber) return;
        setLoading(true);
        await onSave(parseInt(newDayNumber), newCity);
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border/40 w-[92vw] max-w-[380px] p-5 rounded-2xl gap-6 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold tracking-tight uppercase">
                        {editingDay ? "Editar Dia" : "Novo Dia"}
                    </DialogTitle>
                    <DialogDescription className="text-[11px] font-medium uppercase tracking-tighter opacity-70">
                        Defina o destino e a data do roteiro.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {allDaysCreated ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-amber-500/5 p-6 text-center border border-amber-500/10">
                            <CalendarOff className="text-amber-500" size={32} strokeWidth={1.5} />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-amber-200 uppercase tracking-widest">Limite Atingido</p>
                                <p className="text-[11px] text-muted-foreground uppercase font-bold">
                                    Todos os dias entre as datas selecionadas já foram adicionados.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80 ml-1">Data disponível</Label>
                                <Select value={newDayNumber} onValueChange={setNewDayNumber} disabled={!!editingDay}>
                                    <SelectTrigger className="bg-background/40 border-border/40 h-12 rounded-xl text-xs font-bold uppercase">
                                        <SelectValue placeholder="Escolha a data" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border/40 rounded-xl">
                                        {availableDayNumbers.map((day) => {
                                            const isAlreadyCreated = trip.itinerary?.some(d => d.dayNumber === day.num);
                                            return (
                                                <SelectItem
                                                    key={day.num}
                                                    value={day.num.toString()}
                                                    disabled={isAlreadyCreated && !editingDay}
                                                    className="text-[11px] font-bold uppercase py-3"
                                                >
                                                    {day.label} {isAlreadyCreated ? "(Já cadastrado)" : ""}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-primary/80 ml-1">Onde você estará?</Label>
                                <Input
                                    placeholder="Ex: Paris, Centro Histórico"
                                    value={newCity}
                                    onChange={(e) => setNewCity(e.target.value)}
                                    className="bg-background/40 border-border/40 h-12 rounded-xl text-xs font-bold uppercase placeholder:opacity-50"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="flex-row gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest h-11">
                        {allDaysCreated ? "Fechar" : "Cancelar"}
                    </Button>
                    {!allDaysCreated && (
                        <Button
                            disabled={loading || !newCity || !newDayNumber}
                            onClick={handleConfirm}
                            className="flex-1 bg-primary text-primary-foreground font-black rounded-xl h-11 text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Salvar Dia"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}