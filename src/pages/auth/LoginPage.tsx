import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Plane } from 'lucide-react';
import { LegalTerms } from "@/components/auth/LegalTerms";

export function LoginPage() {
    const { signIn, user, loading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Forçar o modo escuro no HTML para teste (Remover se tiver um ThemeProvider)
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
        if (user && !loading) {
            const destination = location.state?.from || "/";

            navigate(destination, { replace: true });
        }
    }, [user, loading, navigate, location]);

    return (
        /* Trocamos bg-white por bg-background */
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 transition-colors duration-500">

            {/* Círculos de Aura adaptados para OKLCH */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-[400px] text-center">
                <div className="mb-12 flex flex-col items-center gap-6">
                    <div className="group relative">
                        {/* O Ring agora usa a variável --ring do seu CSS */}
                        <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-xl" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl transition-transform duration-500 group-hover:rotate-12">
                            <Plane size={40} fill="currentColor" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">
                            NomadTravel
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            O controle total da sua próxima aventura.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <button
                        onClick={signIn}
                        disabled={loading}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-input bg-card px-6 py-4 font-bold text-card-foreground shadow-sm transition-all hover:bg-accent active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                        ) : (
                            <>
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    alt="Google"
                                    className="h-5 w-5"
                                />
                                <span className="tracking-tight cursor-pointer">Continuar com Google</span>
                            </>
                        )}
                    </button>

                    <p className="px-8 text-xs font-medium leading-relaxed text-muted-foreground">
                        Ao entrar, você concorda com nossos <br />
                        <LegalTerms
                            type="terms"
                            trigger={<span className="cursor-pointer underline decoration-border hover:text-primary transition-colors">Termos de Uso</span>}
                        />
                        {" e "}
                        <LegalTerms
                            type="privacy"
                            trigger={<span className="cursor-pointer underline decoration-border hover:text-primary transition-colors">Política de Privacidade</span>}
                        />.
                    </p>
                </div>
            </div>

            <footer className="absolute bottom-8 flex flex-col items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          Nomad Systems © 2026
        </span>
            </footer>
        </div>
    );
}