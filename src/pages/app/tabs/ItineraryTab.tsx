import { Calendar, Clock, Edit2, Plus, Trash2 } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AIStatusLoading } from "@/components/features/AIStatusLoading";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Trip, DayPlan, Activity } from "@/types";

interface ItineraryTabProps {
    trip: Trip;
    isGenerating: boolean;
    isManualEmpty: boolean;
    onAddDay: () => void;
    onEditDay: (day: DayPlan) => void;
    onDeleteDay: (dayNumber: number) => void;
    onAddActivity: (dayNumber: number) => void;
    onEditActivity: (dayNumber: number, activity: Activity, index: number) => void;
    onDeleteActivity: (dayNumber: number, index: number) => void;
    getFormattedDate: (dayNumber: number) => string;
}

export function ItineraryTab({
                                 trip,
                                 isGenerating,
                                 isManualEmpty,
                                 onAddDay,
                                 onEditDay,
                                 onDeleteDay,
                                 onAddActivity,
                                 onEditActivity,
                                 onDeleteActivity,
                                 getFormattedDate
                             }: ItineraryTabProps) {
    if (isGenerating) return <AIStatusLoading />;

    if (isManualEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/40 rounded-3xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 bg-primary/5 rounded-full text-primary">
                    <Calendar size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="font-bold text-sm">Seu roteiro está vazio</h3>
                    <p className="text-xs text-muted-foreground">Comece adicionando o primeiro dia da sua viagem.</p>
                </div>
                <Button onClick={onAddDay} className="bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl">
                    <Plus size={14} className="mr-2" /> Adicionar Dia
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cronograma</h3>
                <Button onClick={onAddDay} variant="ghost" size="sm" className="cursor-pointer text-primary text-[10px] font-black uppercase hover:bg-primary/10 tracking-widest">
                    <Plus size={14} className="mr-1" /> Add Dia
                </Button>
            </div>

            <Accordion type="single" collapsible defaultValue="day-1" className="space-y-4">
                {trip.itinerary?.map((day) => (
                    <AccordionItem key={day.dayNumber} value={`day-${day.dayNumber}`} className="border border-border/40 bg-card/30 rounded-2xl transition-all data-[state=open]:bg-card/50 overflow-hidden">
                        <div className="flex flex-row items-center w-full group pr-4">
                            <AccordionTrigger className="flex-1 hover:no-underline py-5 px-4 text-left border-none outline-none focus:ring-0 [&>svg]:hidden">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary font-black">
                                        <span className="text-xs leading-none">
                                            {trip.startDate ? format(addDays(parseISO(trip.startDate), day.dayNumber - 1), "dd") : day.dayNumber}
                                        </span>
                                        <span className="text-[7px] uppercase leading-none mt-0.5">
                                            {trip.startDate ? format(addDays(parseISO(trip.startDate), day.dayNumber - 1), "MMM", { locale: ptBR }) : ""}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                                            {getFormattedDate(day.dayNumber)}
                                        </span>
                                        <span className="text-sm font-bold tracking-tight">{day.city}</span>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <div className="flex items-center gap-1 ml-auto">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                        onClick={(e) => { e.stopPropagation(); onEditDay(day); }}>
                                    <Edit2 size={14} />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-card border-border/40 rounded-2xl max-w-[350px]">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-bold uppercase tracking-tight text-sm text-foreground text-center">
                                                Excluir {getFormattedDate(day.dayNumber)}?
                                            </AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="grid grid-cols-2 gap-2">
                                            <AlertDialogCancel className="text-[10px] font-bold uppercase tracking-widest h-9" onClick={(e) => e.stopPropagation()}>Voltar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDeleteDay(day.dayNumber)} className="bg-destructive text-white text-[10px] font-bold uppercase h-9">Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <AccordionContent className="pb-6 px-4">
                            <div className="grid gap-3">
                                {day.activities.map((act, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/10 hover:border-primary/20 transition-all">
                                        <div className="flex flex-col items-center min-w-[40px]">
                                            <Clock size={10} className="text-primary/50 mb-1" />
                                            <span className="text-[9px] font-mono font-bold text-muted-foreground">{act.time}</span>
                                        </div>
                                        <div className="flex-1 text-foreground">
                                            <p className="text-xs font-bold tracking-tight">{act.title}</p>
                                            <span className="text-[7px] font-black uppercase text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded">{act.type}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all ml-auto">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditActivity(day.dayNumber, act, idx)}><Edit2 size={10} /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteActivity(day.dayNumber, idx)}><Trash2 size={10} /></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={() => onAddActivity(day.dayNumber)} variant="outline" size="sm" className="w-full mt-2 text-[10px] font-bold h-8 gap-2 border-dashed border-border/40 hover:bg-primary/5 uppercase tracking-widest">
                                    <Plus size={12} /> Add Atividade
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}