import * as Icons from "lucide-react";
import {Calendar, ChevronDown, Clock, Edit2, MapPin, Plus, Trash2} from "lucide-react";
import {addDays, format, parseISO} from "date-fns";
import {ptBR} from "date-fns/locale";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Button} from "@/components/ui/button";
import {AIStatusLoading} from "@/components/features/AIStatusLoading";
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
import type {Activity, DayPlan, Trip} from "@/types";
import {cn} from "@/lib/utils.ts";

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
    isOwner: boolean;
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
                                 getFormattedDate,
                                 isOwner
                             }: ItineraryTabProps) {

    if (isGenerating) return <AIStatusLoading />;

    if (isManualEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/40 rounded-[32px] bg-muted/5 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Calendar size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="font-black text-xs uppercase tracking-widest">Roteiro Vazio</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Comece a planejar sua jornada.</p>
                </div>
                <Button onClick={onAddDay} className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 rounded-2xl shadow-lg shadow-primary/20">
                    <Plus size={14} className="mr-2" /> Adicionar Dia
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cronograma Consolidado</h3>
                {isOwner && (
                    <Button onClick={onAddDay} variant="ghost" size="sm" className="cursor-pointer text-primary text-[10px] font-black uppercase hover:bg-primary/10 tracking-widest h-8 px-3 rounded-lg">
                        <Plus size={14} className="mr-1" /> Add Dia
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {trip.itinerary?.map((day) => (
                    <Collapsible
                        key={day.dayNumber}
                        defaultOpen={day.dayNumber === 1}
                        className="group border border-border/40 bg-card/30 rounded-[28px] overflow-hidden transition-all data-[state=open]:bg-card/50"
                    >
                        <div className="flex flex-row items-center w-full pr-4 bg-muted/5">
                            <CollapsibleTrigger asChild>
                                <button className="flex-1 flex items-center gap-4 py-5 px-5 text-left outline-none">
                                    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/10 shrink-0">
                                        <span className="text-sm leading-none">
                                            {trip.startDate ? format(addDays(parseISO(trip.startDate), day.dayNumber - 1), "dd") : day.dayNumber}
                                        </span>
                                        <span className="text-[8px] uppercase leading-none mt-0.5 opacity-80">
                                            {trip.startDate ? format(addDays(parseISO(trip.startDate), day.dayNumber - 1), "MMM", { locale: ptBR }) : "DIA"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                                            {getFormattedDate(day.dayNumber)}
                                        </span>
                                        <span className="text-xs font-black uppercase tracking-tight truncate">{day.city}</span>
                                    </div>
                                    <ChevronDown size={16} className="ml-auto text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                </button>
                            </CollapsibleTrigger>

                            {isOwner && (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditDay(day);
                                            }}>
                                        <Edit2 size={14}/>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-xl">
                                                <Trash2 size={14}/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent
                                            className="bg-card border-border/40 rounded-[32px] w-[90vw] max-w-[350px] p-6 shadow-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle
                                                    className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">
                                                    Excluir Dia {day.dayNumber}?
                                                </AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <p className="text-center text-xs font-bold uppercase py-2">Todo o roteiro
                                                deste dia será perdido.</p>
                                            <AlertDialogFooter className="grid grid-cols-2 gap-3 mt-4">
                                                <AlertDialogCancel
                                                    className="text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl border-border/40">Voltar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDeleteDay(day.dayNumber)}
                                                                   className="bg-destructive text-white text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl">Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>

                        <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-300 overflow-visible">
                            <div className="p-5 pt-2 space-y-4">
                                <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-4" />

                                {day.activities && day.activities.length > 0 ? (
                                    <div className="grid gap-3">
                                        {day.activities.map((act, idx) => {
                                            const IconComponent = (Icons as any)[(act as any).iconId] || MapPin;

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => isOwner && onEditActivity(day.dayNumber, act, idx)}
                                                    className={cn(
                                                        "group relative flex items-center gap-4 p-4 rounded-2xl bg-background/40 border border-border/20 transition-all",
                                                        isOwner
                                                            ? "cursor-pointer hover:border-primary/40 hover:bg-background/60 active:scale-[0.98]"
                                                            : "cursor-default"
                                                    )}                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/10 text-primary group-hover:bg-primary/10 transition-colors">
                                                        <IconComponent size={18} strokeWidth={2.5} />
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-8">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock size={10} className="text-primary/50" />
                                                            <span className="text-[10px] font-black text-primary tracking-widest">{act.time}</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold uppercase tracking-tight text-foreground/80 leading-snug">
                                                            {act.title}
                                                        </p>
                                                    </div>
                                                    {isOwner && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-destructive/30 hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteActivity(day.dayNumber, idx);
                                                            }}
                                                        >
                                                            <Trash2 size={14}/>
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-border/10 rounded-[20px] bg-muted/5">
                                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Nenhuma atividade programada</p>
                                    </div>
                                )}
                                {isOwner && (
                                    <Button
                                        onClick={() => onAddActivity(day.dayNumber)}
                                        variant="outline"
                                        className="w-full h-12 text-[10px] font-black uppercase tracking-[0.2em] gap-3 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-all"
                                    >
                                        <Plus size={14} strokeWidth={3}/> Nova Atividade
                                    </Button>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </div>
    );
}