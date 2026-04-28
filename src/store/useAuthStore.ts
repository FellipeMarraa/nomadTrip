import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db, googleProvider } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types';

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => void;
    // Helper para verificar permissões rapidamente no app
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: true,

            initialize: () => {
                onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        const userRef = doc(db, 'users', firebaseUser.uid);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            const userData = userSnap.data() as UserProfile;

                            // Sincroniza dados básicos caso o usuário tenha mudado nome ou foto no Google
                            if (userData.photoURL !== firebaseUser.photoURL || userData.displayName !== firebaseUser.displayName) {
                                const updates = {
                                    displayName: firebaseUser.displayName || userData.displayName,
                                    photoURL: firebaseUser.photoURL || userData.photoURL
                                };
                                await updateDoc(userRef, updates);
                                set({ user: { ...userData, ...updates }, loading: false });
                            } else {
                                set({ user: userData, loading: false });
                            }
                        } else {
                            // Primeiro acesso: Criar perfil no Firestore
                            // A role padrão é 'FREE'. O 'ADMIN_GLOBAL' deve ser alterado manualmente no banco
                            // ou por um convite especial para garantir segurança.
                            const newUser: UserProfile = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                displayName: firebaseUser.displayName || '',
                                photoURL: firebaseUser.photoURL || '',
                                role: 'FREE', // Valor padrão inicial
                                dailyAiUsage: 0,
                                lastAiReset: new Date().toISOString(),
                            };

                            await setDoc(userRef, newUser);
                            set({ user: newUser, loading: false });
                        }
                    } else {
                        set({ user: null, loading: false });
                    }
                });
            },

            signIn: async () => {
                set({ loading: true });
                try {
                    await signInWithPopup(auth, googleProvider);
                } catch (error: any) {
                    if (error.code === 'auth/popup-closed-by-user') {
                        console.log("Login cancelado pelo usuário.");
                    } else {
                        console.error("Erro no login:", error);
                    }
                } finally {
                    set({ loading: false });
                }
            },

            logout: async () => {
                try {
                    await signOut(auth);
                    set({ user: null });
                    localStorage.removeItem('nomad-auth-storage');
                } catch (error) {
                    console.error("Erro ao deslogar:", error);
                }
            },

            // Função para verificar se o usuário logado é um admin global
            isAdmin: () => {
                const user = get().user;
                return user?.role === 'ADMIN_GLOBAL';
            }
        }),
        {
            name: 'nomad-auth-storage',
            // Opcional: define o que deve ser persistido
            partialize: (state) => ({ user: state.user })
        }
    )
);