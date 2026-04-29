import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {LoginPage} from "@/pages/auth/LoginPage.tsx";
import {useAuthStore} from "@/store/useAuthStore.ts";
import {AuthGuard} from "@/components/auth/AuthGuard.tsx";
import {AppShell} from "@/components/layout/AppShell.tsx";
import {Dashboard} from "@/pages/app/Dashboard.tsx";
import {TripDetails} from "@/pages/app/TripDetails.tsx";
import {JoinTripPage} from "@/pages/app/JoinTripPage.tsx";

// Pages temporárias (mantenha-as ou mova para arquivos próprios conforme evoluir)
const WalletPage = () => <div className="p-8 text-sm font-medium uppercase tracking-widest opacity-40">Milhas e Finanças</div>;
const AdminPanel = () => <div className="p-8 text-sm font-medium uppercase tracking-widest opacity-40">Painel do Administrador Global</div>;
const Settings = () => <div className="p-8 text-sm font-medium uppercase tracking-widest opacity-40">Configurações do Perfil</div>;

export default function App() {
    const { initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Rota Pública */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rota de Convite:
                  Mantemos fora do AuthGuard para que o JoinTripPage
                  gerencie o redirecionamento manual preservando os
                  parâmetros de busca (?role=admin).
                */}
                <Route path="/join/:id" element={<JoinTripPage />} />

                {/* Rotas Protegidas */}
                <Route
                    path="/"
                    element={
                        <AuthGuard>
                            <AppShell>
                                <Dashboard />
                            </AppShell>
                        </AuthGuard>
                    }
                />

                <Route
                    path="/trip/:id"
                    element={
                        <AuthGuard>
                            <AppShell>
                                <TripDetails />
                            </AppShell>
                        </AuthGuard>
                    }
                />

                <Route
                    path="/wallet"
                    element={
                        <AuthGuard>
                            <AppShell>
                                <WalletPage />
                            </AppShell>
                        </AuthGuard>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <AuthGuard>
                            <AppShell>
                                <Settings />
                            </AppShell>
                        </AuthGuard>
                    }
                />

                {/* Rota Administrativa Global (Sistema) */}
                <Route
                    path="/admin"
                    element={
                        <AuthGuard adminOnly>
                            <AppShell>
                                <AdminPanel />
                            </AppShell>
                        </AuthGuard>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}