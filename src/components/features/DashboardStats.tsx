import { CheckCircle2, Clock, CalendarRange } from "lucide-react";
import type { Trip } from "@/types";
import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {differenceInDays, parseISO, startOfDay} from "date-fns";

interface DashboardStatsProps {
    trips: Trip[];
}

export function DashboardStats({ trips }: DashboardStatsProps) {
    const { user } = useAuthStore();
    const today = startOfDay(new Date());

    const stats = useMemo(() => {
        // 1. FILTRAR VIAGENS FUTURAS E PEGAR A MAIS PRÓXIMA
        const upcomingTrips = trips
            .filter(t => parseISO(t.startDate) >= today) // Use today aqui
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

        const nextTrip = upcomingTrips[0];

        // CÁLCULO: DIAS PARA O EMBARQUE
        const nextTripDays = nextTrip
            ? differenceInDays(parseISO(nextTrip.startDate), today) // Use today aqui
            : null;

        // CÁLCULO: DURAÇÃO DA PRÓXIMA VIAGEM
        const nextTripDuration = nextTrip
            ? differenceInDays(parseISO(nextTrip.endDate), parseISO(nextTrip.startDate)) + 1
            : null;

        // 2. TAREFAS PENDENTES (Global + Pessoal)
        const pendingTasks = trips.reduce((acc, trip) => {
            const myPending = trip.globalChecklist?.filter(item => {
                const isRelevant = !item.userId || item.userId === user?.uid;
                return isRelevant && !item.completed;
            }).length || 0;
            return acc + myPending;
        }, 0);

        return {
            nextTripDays,
            nextTripDuration,
            pendingTasks
        };
    }, [trips, user?.uid]);

    const items = [
        {
            label: "Próximo Embarque",
            value: stats.nextTripDays !== null
                ? (stats.nextTripDays === 0 ? "É hoje" : `Em ${stats.nextTripDays} dias`)
                : "Sem planos",
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-500/5"
        },
        {
            label: "Duração da Viagem",
            value: stats.nextTripDuration !== null
                ? `${stats.nextTripDuration} dias`
                : "0 dias",
            icon: CalendarRange,
            color: "text-emerald-500",
            bg: "bg-emerald-500/5"
        },
        {
            label: "Tarefas Pendentes",
            value: `${stats.pendingTasks} itens`,
            icon: CheckCircle2,
            color: "text-amber-500",
            bg: "bg-amber-500/5"
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map((stat, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 rounded-3xl border border-border/40 bg-card/20 p-5 transition-all hover:bg-card/40"
                >
                    <div className={`rounded-2xl ${stat.bg} p-3 ${stat.color}`}>
                        <stat.icon size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground leading-none mb-1.5">
                            {stat.label}
                        </p>
                        <h3 className="text-base font-normal tracking-tight text-foreground leading-none">
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}