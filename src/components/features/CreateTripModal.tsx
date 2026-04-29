import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Hotel, Loader2, MapPin, Plane, Plus, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/store/useAuthStore";
import { useTripStore } from "@/store/useTripStore";
import { useTripLimit } from "@/hooks/useTripLimit";
import { cn, generateInviteCode } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CreateTripModal() {
    const { user } = useAuthStore();
    const { createTrip } = useTripStore();
    const { hasReachedLimit } = useTripLimit();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estados do Form
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState<'SINGLE' | 'MULTI'>('SINGLE');
    const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    // Estados Logísticos (Opcionais)
    const [arrivalInfo, setArrivalInfo] = useState({ time: "12:00", location: "" });
    const [departureInfo, setDepartureInfo] = useState({ time: "12:00", location: "" });
    const [hotelAddress, setHotelAddress] = useState("");

    const handleCreate = async () => {
        if (!destination || !date.from || !date.to || !user) return;

        setLoading(true);
        try {
            const diffTime = Math.abs(date.to.getTime() - date.from.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const tripContext = {
                destination,
                tripType,
                arrival: arrivalInfo,
                departure: departureInfo,
                hotel: hotelAddress,
                totalDays: diffDays
            };

            const tripId = await createTrip({
                ownerIds: [user.uid],
                destination,
                startDate: format(date.from, "yyyy-MM-dd"),
                endDate: format(date.to, "yyyy-MM-dd"),
                status: 'START',
                isPro: user.role !== 'FREE',
                inviteCode: generateInviteCode(),
                globalChecklist: [],
                itinerary: [],
                aiMetadata: tripContext,
                members: [{
                    uid: user.uid,
                    name: user.displayName || 'Viajante',
                    photoURL: user.photoURL || '',
                    role: 'OWNER',
                    isGhost: false
                }]
            });

            await useTripStore.getState().generateTripAIContent(tripId, tripContext);

            setIsOpen(false);
            navigate(`/trip/${tripId}`);
        } catch (err) {
            console.error("Erro ao criar viagem:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
                    <Plus size={16} strokeWidth={2.5} />
                    Nova Viagem
                </button>
            </DialogTrigger>

            {/* Ajuste de max-w para 380px e largura mobile 92vw */}
            <DialogContent className="w-[92vw] max-w-[380px] border-border/40 bg-card/95 p-0 backdrop-blur-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <div className="p-5 md:p-6">
                    <DialogHeader className="mb-5">
                        <DialogTitle className="text-lg font-bold tracking-tight">Planejar Roteiro</DialogTitle>
                        <DialogDescription className="text-[11px] leading-relaxed text-muted-foreground">
                            {hasReachedLimit ? "Limite atingido." : "Dê detalhes para a IA criar um roteiro logístico perfeito."}
                        </DialogDescription>
                    </DialogHeader>

                    {hasReachedLimit ? (
                        <div className="rounded-2xl bg-primary/10 p-4 text-center">
                            <p className="text-xs font-medium text-primary">Upgrade necessário para mais viagens.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Tipo de Viagem */}
                            <Tabs defaultValue="SINGLE" onValueChange={(v) => setTripType(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-background/50 rounded-xl h-9 p-1">
                                    <TabsTrigger value="SINGLE" className="text-[9px] font-bold uppercase tracking-widest">Cidade Única</TabsTrigger>
                                    <TabsTrigger value="MULTI" className="text-[9px] font-bold uppercase tracking-widest">Multidestinos</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-primary/80 ml-1">Destino(s)</label>
                                    <div className="relative">
                                        <MapPin size={13} className="absolute left-3.5 top-3 text-primary/60" />
                                        <input
                                            type="text"
                                            placeholder={tripType === 'SINGLE' ? "Ex: Paris" : "Ex: Paris, Londres..."}
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            className="w-full rounded-xl border border-border/40 bg-background/50 pl-9 pr-4 py-2.5 text-xs outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-primary/80 ml-1">Período</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className={cn(
                                                "flex w-full items-center gap-3 rounded-xl border border-border/40 bg-background/50 px-3.5 py-2.5 text-left text-xs transition-all hover:bg-accent/50",
                                                !date.from && "text-muted-foreground"
                                            )}>
                                                <CalendarIcon size={14} className="text-primary/70" />
                                                {date.from ? (
                                                    date.to ? <>{format(date.from, "dd/MM")} - {format(date.to, "dd/MM")}</> : format(date.from, "dd/MM")
                                                ) : <span>Selecione as datas</span>}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-border/40 bg-card" align="center">
                                            <Calendar mode="range" selected={{ from: date.from, to: date.to }} onSelect={(range: any) => setDate({ from: range?.from, to: range?.to })} locale={ptBR} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Seção Logística - Mais compacta */}
                            <div className="space-y-3.5 border-t border-border/40 pt-4">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                                    <Plane size={11} /> Logística de Voos
                                </span>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-bold uppercase text-muted-foreground ml-1">Chegada</label>
                                        <input
                                            type="time"
                                            value={arrivalInfo.time}
                                            onChange={(e) => setArrivalInfo({...arrivalInfo, time: e.target.value})}
                                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-bold uppercase text-muted-foreground ml-1">Partida</label>
                                        <input
                                            type="time"
                                            value={departureInfo.time}
                                            onChange={(e) => setDepartureInfo({...departureInfo, time: e.target.value})}
                                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold uppercase text-muted-foreground ml-1">Endereço (Opcional)</label>
                                    <div className="relative">
                                        <Hotel size={13} className="absolute left-3.5 top-2.5 text-muted-foreground/60" />
                                        <input
                                            type="text"
                                            placeholder="Ex: Nome do Hotel ou Rua"
                                            value={hotelAddress}
                                            onChange={(e) => setHotelAddress(e.target.value)}
                                            className="w-full rounded-xl border border-border/40 bg-background/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={loading || !destination || !date.from || !date.to}
                                className="w-full rounded-xl bg-primary py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="mx-auto animate-spin" size={18} /> : (
                                    <span className="flex items-center justify-center gap-2 uppercase tracking-widest">
                                        <Sparkles size={14} /> Criar Roteiro
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}