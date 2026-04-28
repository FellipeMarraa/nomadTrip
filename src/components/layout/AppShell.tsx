import { Header } from "./Header";

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background">
            {/* Header Global */}
            <Header />

            {/* Conteúdo da Página */}
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 md:px-8">
                    {children}
                </div>
            </main>

            {/* Mobile Nav (Opcional se quiser barra inferior estilo App) */}
            {/* Podemos adicionar aqui depois se preferir navegação por polegar no mobile */}
        </div>
    );
}