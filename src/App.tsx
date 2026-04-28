import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {LoginPage} from "@/pages/auth/LoginPage.tsx";
import {useAuthStore} from "@/store/useAuthStore.ts";
import {AuthGuard} from "@/components/auth/AuthGuard.tsx";
import {AppShell} from "@/components/layout/AppShell.tsx";
import {Dashboard} from "@/pages/app/Dashboard.tsx";
import {TripDetails} from "@/pages/app/TripDetails.tsx";

const WalletPage = () => <div>Milhas e Finanças</div>;
const AdminPanel = () => <div>Painel do Administrador Global</div>;
const Settings = () => <div>Configurações do Perfil</div>;

export default function App() {
    const { initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

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