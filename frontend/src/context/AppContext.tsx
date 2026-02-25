import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { setToken, clearToken, getToken } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  height: number;       // cm
  weight: number;       // kg
  age: number;
  gender: 'male' | 'female' | 'other';
  targetWeight: number; // kg
  equipment: string[];  // equipment names
}

export interface WorkoutEntry {
  id: string;
  date: string;         // YYYY-MM-DD
  exercises: Exercise[];
  symptoms: HealthSymptom[];
  completed: boolean;
}

export interface Exercise {
  type: string;
  data: Record<string, number | string>;
}

export interface HealthSymptom {
  type: 'dizziness' | 'pain' | 'stress';
  location?: string;
  severity: number;     // 1-5
}

interface AppState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  profile: UserProfile | null;
  workouts: WorkoutEntry[];
  authError: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => void;
  addWorkout: (workout: WorkoutEntry) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

// ─── Helper: map backend session → WorkoutEntry ───────────────────────────────
function sessionToEntry(session: any): WorkoutEntry {
  return {
    id: session.id,
    date: session.date?.slice(0, 10) ?? '',
    completed: session.status === 'completed',
    exercises: (session.exercises || []).map((ex: any) => ({
      type: ex.exercise?.name ?? 'Exercise',
      data: {
        sets: ex.sets ?? 0,
        reps: ex.reps ?? 0,
        weight: ex.weightKg ?? 0,
        time: ex.durationMinutes ?? 0,
        distance: ex.distanceKm ?? 0,
        speed: ex.speedKmh ?? 0,
        calories: ex.caloriesBurned ?? 0,
      },
    })),
    symptoms: [],
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: restore session from stored token ──────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    api.auth.me()
      .then(async (user) => {
        setIsAuthenticated(true);
        if (user.profile) {
          // Fetch full profile data
          await loadProfile();
          setIsOnboarded(true);
        }
        await loadWorkouts();
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load profile from backend ──────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      const data = await api.profile.get();
      const p = data.profile;
      if (p) {
        setProfileState({
          height: p.heightCm ?? 170,
          weight: p.weightKg ?? 70,
          age: p.age ?? 25,
          gender: (p.gender as UserProfile['gender']) ?? 'other',
          targetWeight: p.targetWeightKg ?? 65,
          equipment: data.equipment.map(e => e.name),
        });
        setIsOnboarded(true);
      }
    } catch {
      // profile not yet created — user needs onboarding
    }
  };

  // ── Load workout history from backend ─────────────────────────────────────
  const loadWorkouts = async () => {
    try {
      const sessions = await api.workouts.history();
      setWorkouts(sessions.map(sessionToEntry));
    } catch {
      setWorkouts([]);
    }
  };

  // ── Auth: Login ───────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.token);
      setIsAuthenticated(true);
      await loadProfile();
      await loadWorkouts();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth: Sign up ─────────────────────────────────────────────────────────
  const signup = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const res = await api.auth.register(email, password);
      setToken(res.token);
      setIsAuthenticated(true);
      setIsOnboarded(false); // New user → show onboarding
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    }
  }, []);

  // ── Auth: Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setProfileState(null);
    setWorkouts([]);
    setAuthError(null);
  }, []);

  // ── Save profile (onboarding / settings) ─────────────────────────────────
  const setProfile = useCallback(async (p: UserProfile) => {
    try {
      // 1. Save basic profile
      await api.profile.save({
        height: p.height,
        weight: p.weight,
        age: p.age,
        gender: p.gender,
        targetWeight: p.targetWeight,
      });
      // 2. Map equipment names → IDs
      const allEquipment = await api.equipment.list();
      const ids = allEquipment
        .filter(e => p.equipment.includes(e.name))
        .map(e => e.id);
      if (ids.length > 0) {
        await api.profile.saveEquipment(ids);
      }
      // 3. Add a weight-loss goal if targetWeight differs from weight
      if (p.targetWeight !== p.weight) {
        await api.profile.addGoal({
          goalType: 'weight',
          targetValue: p.targetWeight,
        }).catch(() => { });
      }
      setProfileState(p);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setProfileState(p); // Optimistic update even if API fails
    }
  }, []);

  // ── Complete onboarding ───────────────────────────────────────────────────
  const completeOnboarding = useCallback(() => {
    setIsOnboarded(true);
  }, []);

  // ── Log a workout (WorkoutPage calls this) ────────────────────────────────
  const addWorkout = useCallback(async (workout: WorkoutEntry) => {
    // Optimistically add to local state
    setWorkouts(prev => [workout, ...prev]);
    try {
      // Persist to backend
      await api.workouts.log({
        date: workout.date,
        exercises: workout.exercises,
        symptoms: workout.symptoms,
      });
      // Refresh from server so IDs are real
      await loadWorkouts();
    } catch (err) {
      console.error('Failed to save workout to backend:', err);
      // Keep the optimistic entry so UI doesn't regress
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      isAuthenticated, isOnboarded, profile, workouts,
      authError, loading,
      login, signup, logout, setProfile, completeOnboarding, addWorkout,
    }}>
      {children}
    </AppContext.Provider>
  );
};
