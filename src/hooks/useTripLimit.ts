import { useAuthStore } from "@/store/useAuthStore";
import { useTripStore } from "@/store/useTripStore";

export function useTripLimit() {
    const { user } = useAuthStore();
    const { trips } = useTripStore();

    const isPro = user?.role === 'PRO' || user?.role === 'ADMIN_GLOBAL';
    const hasReachedLimit = !isPro && trips.length >= 2;

    return {
        hasReachedLimit,
        isPro
    };
}