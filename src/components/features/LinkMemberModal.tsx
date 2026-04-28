import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, Info, User } from "lucide-react";
import type { Trip, TripMember } from "@/types";

interface LinkMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    ghostMember: TripMember | null;
    trip: Trip;
    onConfirm: (ghostUid: string, realMember: TripMember) => Promise<void>;
}

export function LinkMemberModal({ isOpen, onClose, ghostMember, trip, onConfirm }: LinkMemberModalProps) {
    // Filtra apenas membros que NÃO são fantasmas
    const realMembers = trip.members.filter(m => !m.isGhost);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card border-border/40 w-[94vw] max-w-[400px] p-0 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="p-6 bg-primary/5 border-b border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] text-center text-primary">
                            Vincular Conta
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                        <Info size={18} className="text-amber-500 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-amber-600">Atenção</p>
                            <p className="text-[9px] font-bold uppercase leading-relaxed text-muted-foreground">
                                Você está vinculando os gastos de <span className="text-foreground">"{ghostMember?.name}"</span> a um perfil real. Esta ação transferirá todo o histórico financeiro.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Escolha o usuário real:</label>
                        <div className="grid gap-2">
                            {realMembers.length > 0 ? (
                                realMembers.map((member) => (
                                    <button
                                        key={member.uid}
                                        onClick={() => {
                                            if (ghostMember) onConfirm(ghostMember.uid, member);
                                            onClose();
                                        }}
                                        className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-background/40 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                                {member.photoURL ? (
                                                    <img src={member.photoURL} alt={member.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="text-primary" size={20} />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black uppercase tracking-tight">{member.name}</p>
                                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Membro Ativo</p>
                                            </div>
                                        </div>
                                        <UserCheck size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8 border border-dashed border-border/40 rounded-2xl">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Nenhum membro real disponível</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-muted/10">
                    <Button variant="ghost" onClick={onClose} className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-12 rounded-2xl">
                        Cancelar Operação
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}