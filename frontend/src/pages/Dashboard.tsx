import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, WorkoutEntry } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell, Plus, TrendingDown, Flame, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, LogOut, Sparkles, X, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const { profile, workouts, logout } = useAppState();
  const navigate = useNavigate();
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const workoutMap = useMemo(() => {
    const map = new Map<string, WorkoutEntry>();
    workouts.forEach(w => map.set(w.date, w));
    return map;
  }, [workouts]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday start
    const days: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  }, [calMonth, calYear]);

  const getHeatmapLevel = (day: number): number => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(calYear, calMonth, day);
    if (date.getDay() === 0) return -1; // Sunday / rest
    const workout = workoutMap.get(dateStr);
    if (!workout) return 0;
    const exerciseCount = workout.exercises.length;
    if (exerciseCount >= 4) return 4;
    if (exerciseCount >= 3) return 3;
    if (exerciseCount >= 2) return 2;
    return 1;
  };

  const selectedWorkout = selectedDay ? workoutMap.get(selectedDay) : null;

  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, w) =>
    sum + w.exercises.reduce((eSum, e) => eSum + (Number(e.data.calories) || 0), 0), 0
  );
  const weightDiff = profile ? profile.weight - profile.targetWeight : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayWorkedOut = workoutMap.has(today);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/suggestions')}
            className="text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Workouts', value: totalWorkouts, icon: <Activity className="w-4 h-4" /> },
          { label: 'Calories', value: `${(totalCalories / 1000).toFixed(1)}k`, icon: <Flame className="w-4 h-4" /> },
          { label: 'To Goal', value: `${weightDiff > 0 ? '-' : '+'}${Math.abs(weightDiff)}kg`, icon: <TrendingDown className="w-4 h-4" /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-1.5 text-primary mb-2">
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar */}
      <div className="px-4 mb-6">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
              else setCalMonth(m => m - 1);
            }}>
              <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
            <h3 className="font-display font-semibold text-foreground">
              {MONTHS[calMonth]} {calYear}
            </h3>
            <button onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
              else setCalMonth(m => m + 1);
            }}>
              <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`pad-${i}`} />;
              const level = getHeatmapLevel(day);
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === today;
              const isSunday = level === -1;

              return (
                <button
                  key={i}
                  onClick={() => !isSunday && setSelectedDay(dateStr)}
                  className={`aspect-square rounded-md text-xs font-medium flex items-center justify-center transition-all duration-200
                    ${isSunday ? 'bg-secondary/50 text-muted-foreground/40 cursor-default' : ''}
                    ${!isSunday && level === 0 ? 'heatmap-0 text-muted-foreground hover:ring-1 hover:ring-primary/30' : ''}
                    ${level === 1 ? 'heatmap-1 text-foreground hover:ring-1 hover:ring-primary/50' : ''}
                    ${level === 2 ? 'heatmap-2 text-foreground hover:ring-1 hover:ring-primary/50' : ''}
                    ${level === 3 ? 'heatmap-3 text-primary-foreground hover:ring-1 hover:ring-primary/50' : ''}
                    ${level === 4 ? 'heatmap-4 text-primary-foreground hover:ring-1 hover:ring-primary/50' : ''}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  {isSunday ? 'R' : day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`w-3 h-3 rounded-sm heatmap-${l}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 mb-6"
          >
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display font-semibold text-foreground">{selectedDay}</h4>
                <button onClick={() => setSelectedDay(null)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {selectedWorkout ? (
                <div className="space-y-3">
                  {selectedWorkout.exercises.map((ex, i) => (
                    <div key={i} className="bg-secondary rounded-xl p-3">
                      <p className="text-sm font-semibold text-foreground mb-1">{ex.type}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(ex.data).map(([k, v]) => (
                          <span key={k} className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {profile && (
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Goal Progress</p>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(100, (1 - Math.abs(profile.weight - profile.targetWeight) / profile.weight) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No workout logged for this day.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
        <Button
          onClick={() => navigate('/workout')}
          className={`h-14 px-8 rounded-full font-semibold text-base shadow-2xl ${
            todayWorkedOut
              ? 'bg-secondary text-muted-foreground'
              : 'bg-primary text-primary-foreground glow-primary animate-pulse-glow'
          }`}
        >
          {todayWorkedOut ? (
            <>
              <CalendarIcon className="w-5 h-5 mr-2" />
              Completed Today
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Log Workout
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
