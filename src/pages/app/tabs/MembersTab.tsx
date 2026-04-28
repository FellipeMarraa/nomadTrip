import {Ghost, Link, Shield, Trash2, UserCheck, UserPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {cn} from "@/lib/utils";
import type {Trip} from "@/types";
import {useAuthStore} from "@/store/useAuthStore";

interface MembersTabProps {
    trip: Trip;
    onAddGhost: (name: string) => Promise<void>;
    onLinkMember: (ghostUid: string, realMember: any) => Promise<void>;
    onRemoveMember: (uid: string) => Promise<void>;
}

export function MembersTab({ trip, onAddGhost, onRemoveMember }: MembersTabProps) {
    const { user: currentUser } = useAuthStore();
    const [newGhostName, setNewGhostName] = useState("");

    const handleAdd = async () => {
        if (newGhostName.trim()) {
            await onAddGhost(newGhostName.trim());
            setNewGhostName("");
        }
    };

    // Só o dono (OWNER) pode gerenciar membros
    const isOwner = trip.ownerId === currentUser?.uid;

    if (!isOwner) {
        return (
            <div className="py-20 text-center space-y-3">
                <Shield size={32} className="mx-auto text-muted-foreground/20" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Apenas o administrador pode gerenciar membros.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-8 animate-in fade-in duration-500">
            {/* ADICIONAR FANTASMA */}
            <div className="space-y-3 bg-card/30 border border-border/40 p-4 rounded-2xl">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Adicionar Membro Temporário</h3>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Crie uma conta "fantasma" para gerenciar gastos agora.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        value={newGhostName}
                        onChange={e => setNewGhostName(e.target.value)}
                        placeholder="NOME OU APELIDO"
                        className="flex-1 bg-background/50 border border-border/40 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary/50 uppercase"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={!newGhostName.trim()}
                        className="rounded-xl h-10 px-4"
                    >
                        <UserPlus size={16} />
                    </Button>
                </div>
            </div>

            {/* LISTA DE MEMBROS */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Tripulantes ({trip.members.length})</h3>
                <div className="grid gap-3">
                    {trip.members.map((member) => (
                        <div key={member.uid} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/30">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center border-2",
                                    member.isGhost ? "bg-muted/20 border-dashed border-border" : "bg-primary/10 border-primary/20 text-primary"
                                )}>
                                    {member.isGhost ? <Ghost size={18} /> : <UserCheck size={18} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-tight">{member.name}</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                                            member.isGhost ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                        )}>
                                            {member.isGhost ? "Fantasma" : "Ativo"}
                                        </span>
                                        {member.uid === trip.ownerId && (
                                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground">Dono</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {member.isGhost && (
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" title="Vincular usuário real">
                                        <Link size={16} />
                                    </Button>
                                )}
                                {member.uid !== trip.ownerId && (
                                    <Button
                                        onClick={() => onRemoveMember(member.uid)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}