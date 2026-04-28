import {ArrowRight, Calendar, MapPin, Timer} from "lucide-react";
import {differenceInDays, format, parseISO, startOfDay} from "date-fns";
import {ptBR} from "date-fns/locale";
import {Link} from "react-router-dom";
import type {Trip} from "@/types";

interface TripCardProps {
    trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
    const startDate = parseISO(trip.startDate);
    const now = startOfDay(new Date());

    // Cálculo do contador
    const daysLeft = differenceInDays(startDate, now);
    const isUpcoming = daysLeft >= 0;

    return (
        <Link
            to={`/trip/${trip.id}`}
            className="group relative flex flex-col p-5 rounded-[24px] border border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
        >
            {/* BADGE DE CONTAGEM (Apenas para viagens futuras) */}
            {isUpcoming && (
                <div className="absolute -top-2 -right-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-in zoom-in duration-500">
                    <Timer size={10} strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-tight">
                        {daysLeft === 0 ? "É hoje!" : `Faltam ${daysLeft} dias`}
                    </span>
                </div>
            )}

            <div className="space-y-4">
                {/* DESTINO */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                        <MapPin size={12} />
                        <span>Destino</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight uppercase truncate group-hover:text-primary transition-colors">
                        {trip.destination}
                    </h3>
                </div>

                {/* DATAS E INFOS */}
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Calendar size={14} className="text-primary/40" />
                            <span>
                                {format(startDate, "dd MMM", { locale: ptBR })}
                                <span className="mx-1.5 text-border">•</span>
                                {format(parseISO(trip.endDate), "dd MMM", { locale: ptBR })}
                            </span>
                        </div>

                        {/* RESUMO DE CUSTOS/MEMBROS (OPCIONAL) */}
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black bg-muted/50 px-2 py-0.5 rounded text-muted-foreground uppercase tracking-tighter">
                                {trip.members?.length || 1} Membros
                            </span>
                            <span className="text-[9px] font-black bg-primary/5 px-2 py-0.5 rounded text-primary uppercase tracking-tighter">
                                {trip.expenses?.length || 0} Gastos
                            </span>
                        </div>
                    </div>

                    <div className="h-10 w-10 rounded-xl bg-background border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>
        </Link>
    );
}