import {Ghost, Link as LinkIcon, Shield, Trash2, UserCheck, UserPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useMemo, useState} from "react"; // Adicionado useMemo
import {cn} from "@/lib/utils";
import type {Trip, TripMember} from "@/types";
import {LinkMemberModal} from "@/components/features/LinkMemberModal";

interface MembersTabProps {
    trip: Trip;
    onAddGhost: (name: string) => Promise<void>;
    onLinkMember: (ghostUid: string, realMember: TripMember) => Promise<void>;
    onRemoveMember: (uid: string) => Promise<void>;
    isOwner: boolean;
}

export function MembersTab({ trip, onAddGhost, onRemoveMember, onLinkMember, isOwner }: MembersTabProps) {
    const [newGhostName, setNewGhostName] = useState("");
    const [linkingGhost, setLinkingGhost] = useState<TripMember | null>(null);

    // FILTRO DE SEGURANÇA: Remove duplicados visualmente para não quebrar o React
    const uniqueMembers = useMemo(() => {
        const seen = new Set();
        return trip.members.filter(member => {
            const isDuplicate = seen.has(member.uid);
            seen.add(member.uid);
            return !isDuplicate;
        });
    }, [trip.members]);

    const handleAdd = async () => {
        if (newGhostName.trim()) {
            await onAddGhost(newGhostName.trim());
            setNewGhostName("");
        }
    };

    if (!isOwner) {
        // ... (seu código de acesso restrito permanece igual)
        return (
            <div className="py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto border border-border/40">
                    <Shield size={32} strokeWidth={1.5} className="text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">Acesso Restrito</p>
                    <p className="text-[11px] font-medium text-muted-foreground/60 uppercase max-w-[200px] mx-auto leading-relaxed mt-2">
                        Apenas os administradores da viagem podem gerenciar os tripulantes.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-8 animate-in fade-in duration-500 pb-10">
            {/* ADICIONAR FANTASMA */}
            <div className="space-y-5 bg-card/20 border border-border/40 p-6 rounded-[32px]">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/80">Novo Membro Temporário</h3>
                    <p className="text-[9px] text-muted-foreground/60 uppercase font-medium tracking-wider">
                        Útil para quem ainda não tem o app mas divide gastos.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        value={newGhostName}
                        onChange={e => setNewGhostName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        placeholder="NOME OU APELIDO"
                        className="flex-1 bg-background/40 border border-border/40 rounded-2xl px-5 py-3 text-xs font-medium outline-none focus:border-primary/30 uppercase transition-all placeholder:text-muted-foreground/30"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={!newGhostName.trim()}
                        className="rounded-2xl h-12 w-12 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none p-0 transition-all active:scale-95"
                    >
                        <UserPlus size={18} strokeWidth={1.5} />
                    </Button>
                </div>
            </div>

            {/* LISTA DE MEMBROS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Viajantes Ativos <span className="text-primary/40 ml-1">/ {uniqueMembers.length}</span>
                    </h3>
                </div>

                <div className="grid gap-3">
                    {/* USANDO O uniqueMembers NO MAP */}
                    {uniqueMembers.map((member) => {
                        const memberIsOwner = !!trip.ownerIds?.includes(member.uid);

                        return (
                            <div key={member.uid} className="group flex items-center justify-between p-4 rounded-[28px] border border-border/40 bg-card/20 hover:bg-card/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all overflow-hidden shadow-sm",
                                        member.isGhost ? "bg-muted/5 border-dashed border-border/40" : "bg-primary/5 border-primary/10 text-primary"
                                    )}>
                                        {member.photoURL ? (
                                            <img src={member.photoURL} alt={member.name} className="h-full w-full object-cover" />
                                        ) : (
                                            member.isGhost ? <Ghost size={20} strokeWidth={1.5} className="text-muted-foreground/20" /> : <UserCheck size={20} strokeWidth={1.5} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-tight flex items-center gap-2 text-foreground/90">
                                            {member.name}
                                            {memberIsOwner && (
                                                <span className="text-[7px] font-medium uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10 tracking-widest">ADM</span>
                                            )}
                                        </p>
                                        <span className={cn(
                                            "text-[8px] font-medium uppercase mt-1 inline-block tracking-wider",
                                            member.isGhost ? "text-amber-500/60" : "text-emerald-500/60"
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
                                            className="h-10 w-10 text-primary/60 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                            title="Vincular a usuário real"
                                        >
                                            <LinkIcon size={16} strokeWidth={1.5} />
                                        </Button>
                                    )}

                                    {!memberIsOwner && (
                                        <Button
                                            onClick={() => onRemoveMember(member.uid)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

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