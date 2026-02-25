import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: 'male' | 'female' | 'other';
  targetWeight: number; // kg
  equipment: string[];
}

export interface WorkoutEntry {
  id: string;
  date: string; // YYYY-MM-DD
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
  severity: number; // 1-5
}

interface AppState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  profile: UserProfile | null;
  workouts: WorkoutEntry[];
  login: (email: string, password: string) => void;
  signup: (email: string, password: string) => void;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  addWorkout: (workout: WorkoutEntry) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

// Generate some mock workouts for the past month
const generateMockWorkouts = (): WorkoutEntry[] => {
  const workouts: WorkoutEntry[] = [];
  const today = new Date();
  for (let i = 1; i <= 25; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue; // Skip Sundays
    if (Math.random() > 0.7) continue; // Skip some days randomly
    workouts.push({
      id: `mock-${i}`,
      date: date.toISOString().split('T')[0],
      exercises: [
        { type: 'Treadmill', data: { time: 30, speed: 8, distance: 4, calories: 320, inclination: 2 } },
        { type: 'Cycling', data: { time: 20, calories: 180 } },
      ],
      symptoms: [],
      completed: true,
    });
  }
  return workouts;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(generateMockWorkouts());

  const login = useCallback((_email: string, _password: string) => {
    setIsAuthenticated(true);
    // Mock: if returning user, mark as onboarded
    setIsOnboarded(true);
    setProfileState({
      height: 175, weight: 78, age: 28, gender: 'male',
      targetWeight: 72, equipment: ['Treadmill', 'Cycling', 'Dumbbells', 'Bench Press'],
    });
  }, []);

  const signup = useCallback((_email: string, _password: string) => {
    setIsAuthenticated(true);
    setIsOnboarded(false);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setProfileState(null);
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsOnboarded(true);
  }, []);

  const addWorkout = useCallback((w: WorkoutEntry) => {
    setWorkouts(prev => [w, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      isAuthenticated, isOnboarded, profile, workouts,
      login, signup, logout, setProfile, completeOnboarding, addWorkout,
    }}>
      {children}
    </AppContext.Provider>
  );
};
