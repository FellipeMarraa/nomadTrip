import { Ghost, Link as LinkIcon, Shield, Trash2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Trip, TripMember } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { LinkMemberModal } from "@/components/features/LinkMemberModal";

interface MembersTabProps {
    trip: Trip;
    onAddGhost: (name: string) => Promise<void>;
    onLinkMember: (ghostUid: string, realMember: TripMember) => Promise<void>;
    onRemoveMember: (uid: string) => Promise<void>;
}

export function MembersTab({ trip, onAddGhost, onRemoveMember, onLinkMember }: MembersTabProps) {
    const { user: currentUser } = useAuthStore();
    const [newGhostName, setNewGhostName] = useState("");
    const [linkingGhost, setLinkingGhost] = useState<TripMember | null>(null);

    const handleAdd = async () => {
        if (newGhostName.trim()) {
            await onAddGhost(newGhostName.trim());
            setNewGhostName("");
        }
    };

    const isOwner = trip.ownerId === currentUser?.uid;

    if (!isOwner) {
        return (
            <div className="py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto border border-border/40">
                    <Shield size={32} className="text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Acesso Restrito</p>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase max-w-[200px] mx-auto leading-relaxed">
                        Apenas o administrador da viagem pode gerenciar os tripulantes.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            {/* ADICIONAR FANTASMA */}
            <div className="space-y-4 bg-card/40 border border-border/40 p-6 rounded-[32px] shadow-sm">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Novo Membro Temporário</h3>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">
                        Útil para quem ainda não tem o app mas divide gastos com você.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        value={newGhostName}
                        onChange={e => setNewGhostName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder="NOME OU APELIDO"
                        className="flex-1 bg-background/50 border border-border/40 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:border-primary/50 uppercase transition-all"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={!newGhostName.trim()}
                        className="rounded-2xl h-12 w-12 shadow-lg shadow-primary/20 p-0"
                    >
                        <UserPlus size={18} />
                    </Button>
                </div>
            </div>

            {/* LISTA DE MEMBROS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Tripulantes Ativos <span className="text-primary/40 ml-1">/ {trip.members.length}</span>
                    </h3>
                </div>

                <div className="grid gap-3">
                    {trip.members.map((member) => (
                        <div key={member.uid} className="group flex items-center justify-between p-4 rounded-[24px] border border-border/40 bg-card/30 hover:bg-card/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all overflow-hidden shadow-sm",
                                    member.isGhost ? "bg-muted/10 border-dashed border-border" : "bg-primary/5 border-primary/20 text-primary"
                                )}>
                                    {member.photoURL ? (
                                        <img src={member.photoURL} alt={member.name} className="h-full w-full object-cover" />
                                    ) : (
                                        member.isGhost ? <Ghost size={20} className="text-muted-foreground/40" /> : <UserCheck size={20} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                                        {member.name}
                                        {member.uid === trip.ownerId && (
                                            <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">ADM</span>
                                        )}
                                    </p>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase mt-1 inline-block",
                                        member.isGhost ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {member.isGhost ? "• Conta Fantasma" : "• Conta Ativa"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {member.isGhost && (
                                    <Button
                                        onClick={() => setLinkingGhost(member)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl"
                                        title="Vincular a usuário real"
                                    >
                                        <LinkIcon size={16} />
                                    </Button>
                                )}
                                {member.uid !== trip.ownerId && (
                                    <Button
                                        onClick={() => onRemoveMember(member.uid)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Vínculo */}
            <LinkMemberModal
                isOpen={!!linkingGhost}
                onClose={() => setLinkingGhost(null)}
                ghostMember={linkingGhost}
                trip={trip}
                onConfirm={onLinkMember}
            />
        </div>
    );
}