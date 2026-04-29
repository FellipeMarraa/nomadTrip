import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTripStore } from '@/store/useTripStore';
import { useAuthStore } from '@/store/useAuthStore';
import {doc, updateDoc, arrayUnion, getDoc} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function JoinTripPage() {
    const { id } = useParams();
    const { user, loading } = useAuthStore();
    const { addMember } = useTripStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Captura os parâmetros da URL (ex: ?role=admin)
    const [searchParams] = useSearchParams();
    const isAdminInvite = searchParams.get("role") === "admin";

    useEffect(() => {
        // Espera o Firebase inicializar a autenticação
        if (loading) return;

        // Se NÃO está logado, manda para o login salvando esta rota de convite para voltar depois
        if (!user) {
            navigate("/login", { state: { from: location }, replace: true });
            return;
        }

        // Se ESTÁ logado, processa a entrada na viagem
        const join = async () => {
            try {
                // Buscamos os dados atuais da viagem para verificar duplicidade
                const tripRef = doc(db, "trips", id!);
                const tripSnap = await getDoc(tripRef); // Importe o getDoc do firebase/firestore

                if (!tripSnap.exists()) {
                    toast.error("Viagem não encontrada.");
                    return navigate("/");
                }

                const tripData = tripSnap.data();
                const isAlreadyMember = tripData.members_ids?.includes(user.uid);

                if (!isAlreadyMember) {
                    // SÓ ADICIONA SE NÃO FOR MEMBRO
                    await addMember(id!, {
                        uid: user.uid,
                        name: user.displayName || "Viajante",
                        photoURL: user.photoURL || "",
                        role: isAdminInvite ? 'OWNER' : 'MEMBER',
                        isGhost: false
                    });
                }

                // SE FOR CONVITE DE ADMIN, GARANTE QUE ELE ESTEJA NO ownerIds (mesmo que já fosse membro)
                if (isAdminInvite) {
                    const isAlreadyOwner = tripData.ownerIds?.includes(user.uid);
                    if (!isAlreadyOwner) {
                        await updateDoc(tripRef, {
                            ownerIds: arrayUnion(user.uid),
                            // Opcional: Atualizar a role dentro do array de objetos 'members'
                            members: tripData.members.map((m: any) =>
                                m.uid === user.uid ? { ...m, role: 'OWNER' } : m
                            )
                        });
                    }
                }

                toast.success("Sincronizado com sucesso!");
                setTimeout(() => navigate(`/trip/${id}`, { replace: true }), 500);

            } catch (error: any) {
                console.error("Erro no Join:", error);
                if (error.code === 'permission-denied') {
                    toast.error("Acesso negado ou convite inválido.");
                } else {
                    toast.error("Não foi possível processar seu convite.");
                }
                navigate("/dashboard");
            }
        };

        if (id) join();
    }, [user, loading, id, navigate, location, addMember, isAdminInvite]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
            <div className="relative mb-6">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-2xl" />
                <Loader2 className="relative animate-spin text-primary/40" size={42} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/60 animate-pulse">
                    Sincronizando Convite
                </h2>
                {isAdminInvite && (
                    <span className="text-[9px] font-medium uppercase tracking-widest text-primary/50">
                        Nível de Acesso: Administrador
                    </span>
                )}
            </div>
        </div>
    );
}