import {CheckCircle2, Globe, Map} from "lucide-react";
import type {Trip} from "@/types";
import {useMemo} from "react";

interface DashboardStatsProps {
    trips: Trip[];
}

export function DashboardStats({ trips }: DashboardStatsProps) {
    // Usamos useMemo para não refazer cálculos a cada renderização, apenas quando trips mudar
    const stats = useMemo(() => {
        const totalTrips = trips.length;

        // Calcula o total de tarefas pendentes em todas as viagens
        const pendingTasks = trips.reduce((acc, trip) => {
            const tasks = trip.globalChecklist?.filter(item => !item.completed).length || 0;
            return acc + tasks;
        }, 0);

        // Extrai destinos únicos para contar locais
        const uniqueDestinations = new Set(trips.map(t => t.destination.split(',')[0].trim())).size;

        return {
            totalTrips,
            pendingTasks,
            uniqueDestinations
        };
    }, [trips]);

    const items = [
        {
            label: "Total de Viagens",
            value: stats.totalTrips,
            icon: Map,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Locais Explorados",
            value: stats.uniqueDestinations,
            icon: Globe,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Tarefas Pendentes",
            value: stats.pendingTasks,
            icon: CheckCircle2,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map((stat, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/30 p-4 transition-all hover:bg-card/50"
                >
                    <div className={`rounded-xl ${stat.bg} p-2.5 ${stat.color}`}>
                        <stat.icon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {stat.label}
                        </p>
                        <h3 className="text-xl font-bold tracking-tight">
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}