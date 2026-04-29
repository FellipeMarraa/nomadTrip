import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTripStore } from '@/store/useTripStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function JoinTripPage() {
    const { id } = useParams();
    const { user, loading } = useAuthStore();
    const { addMember } = useTripStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Espera o Firebase inicializar
        if (loading) return;

        // Se NÃO está logado, manda para o login salvando esta rota de convite
        if (!user) {
            navigate("/login", { state: { from: location }, replace: true });
            return;
        }

        // Se ESTÁ logado, processa o convite
        const join = async () => {
            try {
                await addMember(id!, {
                    uid: user.uid,
                    name: user.displayName || "Viajante",
                    photoURL: user.photoURL || "",
                    role: 'MEMBER',
                    isGhost: false
                });
                toast.success("Bem-vindo à viagem!");
                navigate(`/trip/${id}`, { replace: true });
            } catch (error) {
                console.error(error);
                toast.error("Erro ao processar convite.");
                navigate("/");
            }
        };

        join();
    }, [user, loading, id, navigate, location, addMember]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Sincronizando Convite...
            </h2>
        </div>
    );
}