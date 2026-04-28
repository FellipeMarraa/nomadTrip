import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {onAuthStateChanged, signInWithPopup, signOut} from 'firebase/auth';
import {ADMIN_GLOBAL_ID, auth, db, googleProvider} from '@/config/firebase';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import type {UserProfile} from '@/types';

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loading: true,

            initialize: () => {
                onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        const userRef = doc(db, 'users', firebaseUser.uid);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            set({ user: userSnap.data() as UserProfile, loading: false });
                        } else {
                            // Primeiro acesso: Criar perfil no Firestore
                            const newUser: UserProfile = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                displayName: firebaseUser.displayName || '',
                                photoURL: firebaseUser.photoURL || '',
                                role: firebaseUser.uid === ADMIN_GLOBAL_ID ? 'ADMIN_GLOBAL' : 'FREE',
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
                        console.error("Erro desconhecido no login:", error);
                    }
                } finally {
                    set({ loading: false });
                }
            },

            logout: async () => {
                await signOut(auth);
                set({ user: null });
            },
        }),
        { name: 'nomad-auth-storage' }
    )
);