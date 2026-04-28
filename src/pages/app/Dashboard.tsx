import { useEffect, useMemo } from "react";
import { PlaneTakeoff, Timer } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTripStore } from "@/store/useTripStore";
import { DashboardStats } from "@/components/features/DashboardStats";
import { TripCard } from "@/components/features/TripCard";
import { CreateTripModal } from "@/components/features/CreateTripModal.tsx";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

export function Dashboard() {
    const { user } = useAuthStore();
    const { trips, subscribeToTrips } = useTripStore();

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToTrips(user.uid);
            return () => unsubscribe();
        }
    }, [user?.uid, subscribeToTrips]);

    // Lógica para encontrar a próxima viagem e calcular os dias
    const nextTripCountdown = useMemo(() => {
        if (!trips.length) return null;

        const now = startOfDay(new Date());

        // Filtra viagens que ainda não começaram e ordena pela data mais próxima
        const upcomingTrips = trips
            .filter(trip => parseISO(trip.startDate) >= now)
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

        if (upcomingTrips.length === 0) return null;

        const nextTrip = upcomingTrips[0];
        const daysLeft = differenceInDays(parseISO(nextTrip.startDate), now);

        return {
            days: daysLeft,
            destination: nextTrip.destination
        };
    }, [trips]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <section className="flex flex-row items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                        Olá, {user?.displayName?.split(" ")[0]}
                    </h1>

                    {/* TEMPORIZADOR ESTILIZADO */}
                    {nextTripCountdown && (
                        <div className="flex items-center gap-2 text-primary animate-pulse-subtle">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                {nextTripCountdown.days === 0
                                    ? <> <Timer size={14} strokeWidth={2.5} /> "É hoje o embarque!" </>
                                    : ``}
                            </span>
                        </div>
                    )}
                </div>

                <CreateTripModal />
            </section>

            <DashboardStats trips={trips} />

            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Viagens Ativas
                    </h2>
                    <div className="h-px flex-1 bg-border/40 mx-4" />
                    <span className="text-[10px] font-bold text-muted-foreground/60">
                        {trips.length} totais
                    </span>
                </div>

                {trips.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {trips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/10 py-16 text-center">
                        <PlaneTakeoff size={24} className="text-muted-foreground/40 mb-3" />
                        <h3 className="text-sm font-bold text-foreground">Nenhum roteiro por aqui</h3>
                        <p className="mt-1 text-[11px] text-muted-foreground uppercase font-medium tracking-tight">
                            Planeje seu próximo destino agora.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}