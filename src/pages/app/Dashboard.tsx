import { useEffect } from "react";
import { PlaneTakeoff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTripStore } from "@/store/useTripStore";
import { DashboardStats } from "@/components/features/DashboardStats";
import { TripCard } from "@/components/features/TripCard";
import { CreateTripModal } from "@/components/features/CreateTripModal.tsx";

export function Dashboard() {
    const { user } = useAuthStore();
    const { trips, subscribeToTrips } = useTripStore();

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToTrips(user.uid);
            return () => unsubscribe();
        }
    }, [user?.uid, subscribeToTrips]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <section className="flex flex-row items-center justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                        Olá, {user?.displayName?.split(" ")[0]}
                    </h1>
                </div>

                <CreateTripModal />
            </section>

            {/* AQUI: Passando as trips para que os cálculos sejam dinâmicos */}
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
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Planeje seu próximo destino.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}