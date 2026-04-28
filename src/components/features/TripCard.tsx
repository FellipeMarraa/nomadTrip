import { Calendar, Users, Star, ArrowRight } from "lucide-react";
import type {Trip} from "@/types";
import { Link } from "react-router-dom";

export function TripCard({ trip }: { trip: Trip }) {
    return (
        <Link to={`/trip/${trip.id}`} className="group relative block outline-none">
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/50 transition-all hover:border-primary/30 hover:bg-card">

                <div className="relative aspect-[21/9] w-full overflow-hidden">
                    <img
                        src={`https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800&auto=format&fit=crop`}
                        alt={trip.destination}
                        className="h-full w-full object-cover grayscale-[20%] transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    {trip.isPro && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-primary/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-primary-foreground">
                            <Star size={8} fill="currentColor" />
                            PRO
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight text-foreground">
                                {trip.destination}
                            </h3>
                            <div className="mt-1.5 flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-primary/70" />
                  Jun 09 — Jun 23
                </span>
                                <span className="flex items-center gap-1">
                  <Users size={12} className="text-primary/70" />
                                    {trip.members.length}
                </span>
                            </div>
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}