// Central API client — all backend calls go through here
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Token helpers ───────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('token');
export const setToken = (t: string) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
    token: string;
    user: { id: string; email: string };
}

export interface ProfileData {
    profile: {
        id: string;
        userId: string;
        heightCm: number | null;
        weightKg: number | null;
        age: number | null;
        gender: string | null;
        targetWeightKg: number | null;
    } | null;
    goals: Goal[];
    equipment: { id: string; name: string; category: string }[];
}

export interface Goal {
    id: string;
    goalType: string;
    targetValue: number | null;
    currentValue: number | null;
    targetDate: string | null;
    status: string;
    createdAt: string;
}

export interface WorkoutSession {
    id: string;
    userId: string;
    date: string;
    status: string;
    totalDurationMinutes: number | null;
    totalCaloriesBurned: number | null;
    exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
    id: string;
    exerciseId: string;
    orderIndex: number | null;
    sets: number | null;
    reps: number | null;
    weightKg: number | null;
    durationMinutes: number | null;
    distanceKm: number | null;
    speedKmh: number | null;
    inclinePercent: number | null;
    caloriesBurned: number | null;
    completed: boolean;
    exercise?: { id: string; name: string; category: string };
}

export interface AnalyticsProgress {
    total_workouts: number;
    completed: number;
    weekly_completion_percent: number;
    calories_last_30_days: number;
    total_minutes: number;
    weekly_breakdown: { week: string; workouts: number; calories: number }[];
}

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface EquipmentItem {
    id: string;
    name: string;
    category: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const api = {
    auth: {
        login: (email: string, password: string) =>
            request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

        register: (email: string, password: string) =>
            request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

        me: () =>
            request<{ id: string; email: string; isVerified: boolean; profile: ProfileData['profile'] }>('/auth/me'),

        forgotPassword: (email: string) =>
            request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    },

    // ─── Profile ────────────────────────────────────────────────────────────────
    profile: {
        get: () => request<ProfileData>('/profile'),

        save: (data: { height: number; weight: number; age: number; gender: string; targetWeight: number }) =>
            request('/profile', { method: 'POST', body: JSON.stringify(data) }),

        update: (data: { height?: number; weight?: number; age?: number; gender?: string; targetWeight?: number }) =>
            request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

        saveEquipment: (equipmentIds: string[]) =>
            request('/profile/equipment', { method: 'POST', body: JSON.stringify({ equipmentIds }) }),

        addGoal: (data: { goalType: string; targetValue?: number; targetDate?: string }) =>
            request<Goal>('/profile/goals', { method: 'POST', body: JSON.stringify(data) }),

        getGoals: () => request<Goal[]>('/profile/goals'),
    },

    // ─── Equipment ──────────────────────────────────────────────────────────────
    equipment: {
        list: () => request<EquipmentItem[]>('/equipment'),
    },

    // ─── Workouts ───────────────────────────────────────────────────────────────
    workouts: {
        history: () => request<WorkoutSession[]>('/workouts'),

        today: () => request<WorkoutSession>('/workouts/today'),

        log: (data: {
            date: string;
            exercises: { type: string; data: Record<string, number | string>; }[];
            symptoms: { type: string; severity: number; location?: string }[];
        }) =>
            request<WorkoutSession>('/workouts', { method: 'POST', body: JSON.stringify(data) }),

        start: (sessionId: string) =>
            request(`/workouts/${sessionId}/start`, { method: 'POST' }),

        complete: (sessionId: string) =>
            request(`/workouts/${sessionId}/complete`, { method: 'POST' }),
    },

    // ─── Calendar ───────────────────────────────────────────────────────────────
    calendar: {
        month: (month: string) => // format: YYYY-MM
            request<{ date: string; status: string; total_duration: number; calories: number; exercises_count: number }[]>(
                `/calendar?month=${month}`
            ),
        day: (date: string) => request<WorkoutSession>(`/calendar/${date}`),
    },

    // ─── Analytics ──────────────────────────────────────────────────────────────
    analytics: {
        progress: () => request<AnalyticsProgress>('/analytics/progress'),
    },

    // ─── Notifications ──────────────────────────────────────────────────────────
    notifications: {
        list: () => request<Notification[]>('/notifications'),
        markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    },

    // ─── Recommendations ────────────────────────────────────────────────────────
    recommendations: {
        daily: () => request<{ exercises: { id: string; name: string; sets: number; reps: number }[] }>('/recommendations/daily'),
    },

    // ─── Health ─────────────────────────────────────────────────────────────────
    health: {
        check: () => request<{ status: string; time: string }>('/health'),
    },
};

export default api;
