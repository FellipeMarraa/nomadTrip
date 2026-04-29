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
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/10 rounded-[32px] bg-muted/5 space-y-4 animate-in fade-in">
                <div className="p-4 bg-primary/5 rounded-full text-primary/60">
                    <Calendar size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="font-medium text-[10px] uppercase tracking-[0.2em]">Roteiro Vazio</h3>
                    <p className="text-[9px] text-muted-foreground/40 uppercase font-medium">Comece a planejar sua jornada.</p>
                </div>
                <Button onClick={onAddDay} className="bg-primary/10 text-primary font-medium uppercase text-[10px] tracking-[0.2em] h-11 px-8 rounded-2xl border-none shadow-none">
                    <Plus size={14} className="mr-2" /> Adicionar Dia
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">Cronograma Consolidado</h3>
                {isOwner && (
                    <Button onClick={onAddDay} variant="ghost" size="sm" className="text-primary text-[10px] font-medium uppercase hover:bg-primary/5 tracking-[0.2em] h-8 px-3 rounded-lg">
                        <Plus size={14} className="mr-1" /> Add Dia
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {trip.itinerary?.map((day) => (
                    <Collapsible
                        key={day.dayNumber}
                        defaultOpen={day.dayNumber === 1}
                        className="group border border-border/40 bg-card/20 rounded-[28px] overflow-hidden transition-all data-[state=open]:bg-card/40"
                    >
                        <div className="flex flex-row items-center w-full pr-4 bg-muted/5">
                            <CollapsibleTrigger asChild>
                                {/* AJUSTE: items-start para alinhar ao topo se o nome da cidade crescer */}
                                <button className="flex-1 flex items-start gap-4 py-5 px-5 text-left outline-none min-w-0">
                                    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary font-medium border border-primary/10 shrink-0">
                                        <span className="text-sm leading-none">
                                            {trip.startDate ? format(addDays(parseISO(trip.startDate), day.dayNumber - 1), "dd") : day.dayNumber}
                                        </span>
                                        <span className="text-[8px] uppercase leading-none mt-1 opacity-60">
                                            {trip.startDate ? format(addDays(parseISO(trip.startDate), day.dayNumber - 1), "MMM", { locale: ptBR }) : "DIA"}
                                        </span>
                                    </div>

                                    {/* AJUSTE: flex-1 e min-w-0 para conter o texto */}
                                    <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                                        <span className="text-[8px] font-medium text-primary/60 uppercase tracking-[0.2em] mb-1">
                                            {getFormattedDate(day.dayNumber)}
                                        </span>
                                        {/* REMOVIDO truncate e ADICIONADO break-words */}
                                        <span className="text-xs font-medium uppercase tracking-tight break-words leading-tight">
                                            {day.city}
                                        </span>
                                    </div>

                                    <ChevronDown size={16} strokeWidth={1.5} className="ml-2 text-muted-foreground/40 transition-transform duration-300 group-data-[state=open]:rotate-180 shrink-0 mt-3" />
                                </button>
                            </CollapsibleTrigger>

                            {isOwner && (
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon"
                                            className="h-9 w-9 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditDay(day);
                                            }}>
                                        <Edit2 size={14} strokeWidth={1.5}/>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"
                                                    className="h-9 w-9 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors">
                                                <Trash2 size={14} strokeWidth={1.5}/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-3xl border-border/40">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="font-medium uppercase tracking-[0.15em] text-xs text-muted-foreground text-center">
                                                    Excluir Dia {day.dayNumber}?
                                                </AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <p className="text-center text-[11px] font-medium uppercase tracking-wider py-2 text-foreground/70">Todo o roteiro deste dia será perdido.</p>
                                            <AlertDialogFooter className="grid grid-cols-2 gap-3 mt-4">
                                                <AlertDialogCancel className="text-[10px] font-medium uppercase tracking-widest h-11 rounded-2xl border-none bg-muted/50">Voltar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDeleteDay(day.dayNumber)}
                                                                   className="bg-destructive text-white text-[10px] font-medium uppercase tracking-widest h-11 rounded-2xl">Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>

                        <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="p-5 pt-2 space-y-4">
                                <div className="h-px bg-border/5 mb-4" />

                                {day.activities && day.activities.length > 0 ? (
                                    <div className="grid gap-3">
                                        {day.activities.map((act, idx) => {
                                            const IconComponent = (Icons as any)[(act as any).iconId] || MapPin;

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => isOwner && onEditActivity(day.dayNumber, act, idx)}
                                                    className={cn(
                                                        "group relative flex items-center gap-4 p-4 rounded-2xl bg-background/20 border border-border/10 transition-all",
                                                        isOwner ? "cursor-pointer hover:border-primary/20 hover:bg-background/40 active:scale-[0.99]" : "cursor-default"
                                                    )}
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary/70 group-hover:bg-primary/10 transition-colors">
                                                        <IconComponent size={18} strokeWidth={1.5} />
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-8">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock size={10} strokeWidth={1.5} className="text-primary/40" />
                                                            <span className="text-[10px] font-medium text-primary/60 tracking-widest">{act.time}</span>
                                                        </div>
                                                        {/* AJUSTE: Permitir quebra de linha no título da atividade também */}
                                                        <p className="text-[11px] font-medium uppercase tracking-tight text-foreground/80 leading-snug break-words">
                                                            {act.title}
                                                        </p>
                                                    </div>
                                                    {isOwner && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-3 h-8 w-8 text-destructive/20 hover:text-destructive hover:bg-destructive/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteActivity(day.dayNumber, idx);
                                                            }}
                                                        >
                                                            <Trash2 size={14} strokeWidth={1.5}/>
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-border/5 rounded-[20px] bg-muted/5">
                                        <p className="text-[9px] font-medium text-muted-foreground/30 uppercase tracking-[0.2em]">Nenhuma atividade</p>
                                    </div>
                                )}
                                {isOwner && (
                                    <Button
                                        onClick={() => onAddActivity(day.dayNumber)}
                                        variant="outline"
                                        className="w-full h-11 text-[10px] font-medium uppercase tracking-[0.2em] gap-3 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-all"
                                    >
                                        <Plus size={14} strokeWidth={1.5}/> Nova Atividade
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