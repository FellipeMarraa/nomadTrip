import { useAuthStore } from '@/store/useAuthStore';
import type {Trip} from '@/types';

export function useRole(trip?: Trip | null) {
    const { user } = useAuthStore();

    const isGlobalAdmin = user?.role === 'ADMIN_GLOBAL';
    const isUserPro = user?.role === 'PRO';

    const isTripPro = trip?.isPro || false;

    const hasProAccess = isGlobalAdmin || isUserPro || isTripPro;

    const isTripOwner = trip?.ownerId === user?.uid;

    return {
        isGlobalAdmin,
        isUserPro,
        isTripPro,
        hasProAccess,
        isTripOwner
    };
}