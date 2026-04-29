import { useEffect, useMemo } from "react";
import { PlaneTakeoff, Timer, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTripStore } from "@/store/useTripStore";
import { DashboardStats } from "@/components/features/DashboardStats";
import { TripCard } from "@/components/features/TripCard";
import { CreateTripModal } from "@/components/features/CreateTripModal.tsx";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

export function Dashboard() {
    const { user, isAdmin } = useAuthStore();
    const { trips, subscribeToTrips } = useTripStore();

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToTrips(user.uid);
            return () => unsubscribe();
        }
    }, [user?.uid, subscribeToTrips]);

    // Ordenação: Viagens mais próximas primeiro
    const sortedTrips = useMemo(() => {
        return [...trips].sort((a, b) => {
            const dateA = parseISO(a.startDate).getTime();
            const dateB = parseISO(b.startDate).getTime();
            return dateA - dateB;
        });
    }, [trips]);

    // Lógica para encontrar a próxima viagem e calcular os dias
    const nextTripCountdown = useMemo(() => {
        if (!trips.length) return null;

        const now = startOfDay(new Date());

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

    // Verificação de permissão
    const isGlobalAdmin = isAdmin();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* HEADER */}
            <section className="flex flex-row items-center justify-between border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-normal tracking-tight md:text-2xl text-foreground">
                        Olá, {user?.displayName?.split(" ")[0]}
                    </h1>

                    {/* TEMPORIZADOR ESTILIZADO */}
                    {nextTripCountdown && (
                        <div className="flex items-center gap-2 text-primary/80 animate-pulse-subtle">
                            <Timer size={14} strokeWidth={1.5} />
                            <span className="text-[10px] font-medium uppercase tracking-[0.15em]">
                                {nextTripCountdown.days === 0
                                    ? "É hoje o seu embarque!"
                                    : `Falta pouco para sua viagem`}
                            </span>
                        </div>
                    )}
                </div>

                {/* SÓ MOSTRA O BOTÃO DE CRIAR SE FOR ADMIN_GLOBAL */}
                {isGlobalAdmin ? (
                    <CreateTripModal />
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/10 border border-border/40 opacity-60">
                        <ShieldAlert size={14} className="text-muted-foreground" />
                        <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Modo Visualização</span>
                    </div>
                )}
            </section>

            <DashboardStats trips={trips} />

            <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {isGlobalAdmin ? "Minhas Viagens" : "Viagens que participo"}
                    </h2>
                    <div className="h-px flex-1 bg-border/20 mx-4" />
                    <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                        {trips.length} {trips.length === 1 ? 'total' : 'totais'}
                    </span>
                </div>

                {sortedTrips.length > 0 ? (
                    /* Grid Responsivo: O scroll é natural da página (melhor UX) */
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-[32px] border border-border/40 bg-card/10 py-20 text-center">
                        <PlaneTakeoff size={28} strokeWidth={1.2} className="text-muted-foreground/30 mb-4" />
                        <h3 className="text-sm font-normal text-foreground">Nenhum roteiro por aqui</h3>
                        <p className="mt-2 text-[10px] text-muted-foreground uppercase font-medium tracking-widest">
                            {isGlobalAdmin
                                ? "Crie seu primeiro roteiro agora."
                                : "Aguarde o convite de um administrador."}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}