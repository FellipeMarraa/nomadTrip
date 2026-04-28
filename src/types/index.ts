export type UserRole = 'ADMIN_GLOBAL' | 'PRO' | 'FREE';
export type TripRole = 'OWNER' | 'MEMBER' | 'GHOST';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: UserRole;
    dailyAiUsage: number;
    lastAiReset: string; // ISO Date
}

export interface TripMember {
    uid: string;
    name: string;
    photoURL?: string;
    role: TripRole;
    isGhost: boolean;
}

export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: "FOOD" | "TRANSPORT" | "LODGING" | "LEISURE" | "SHOPPING" | "OTHER";
    date: string;
    dayNumber: number; // Vínculo com o dia da viagem
    paidBy: string; // UID do membro que pagou
    participants: string[]; // Lista de UIDs de quem participa da conta
}

export interface AIContext {
    destination: string;
    tripType: 'SINGLE' | 'MULTI';
    arrival: { time: string; location: string };
    departure: { time: string; location: string };
    hotel: string;
    totalDays: number;
}

export interface Settlement {
    from: string; // UID de quem devia
    to: string;   // UID de quem recebeu
    amount: number;
    date: string;
}

export interface Trip {
    id: string;
    ownerId: string;
    destination: string;
    startDate: string;
    endDate: string;
    isPro: boolean; // Se o owner for PRO, a viagem toda é PRO
    inviteCode: string;
    members: TripMember[];
    members_ids: string[];
    globalChecklist: ChecklistItem[];
    itinerary: DayPlan[];
    status: 'START' | 'GENERATING' | 'COMPLETED' | 'MANUAL';
    aiMetadata?: any;
    createdAt?: any;
    expenses: Expense[];
    settlements?: Settlement[];
}

export interface ChecklistItem {
    id: string;
    task: string;
    completed: boolean;
    category: string;
    updatedBy?: string; // UID do membro que marcou
}

export interface Coupon {
    code: string;
    maxUses: number;
    currentUses: number;
    expiryDate: string;
    active: boolean;
}

export interface Activity {
    id: string;
    time?: string; // Ex: "09:00"
    title: string;
    description?: string;
    location?: string;
    type: 'FOOD' | 'CULTURE' | 'TRANSPORT' | 'LEISURE';
}

export interface DayPlan {
    dayNumber: number;
    city: string;
    activities: Activity[];
}