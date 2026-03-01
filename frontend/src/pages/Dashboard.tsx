import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, WorkoutEntry } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell, Plus, TrendingDown, Flame, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Sparkles, X, Activity,
  Trophy, HeartPulse, Scale, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const { profile, workouts } = useAppState();
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
  const totalWorkouts = workouts.filter(w => w.completed).length;
  const totalCalories = workouts.reduce((sum, w) =>
    sum + w.exercises.reduce((eSum, e) => eSum + (Number(e.data.calories) || 0), 0), 0
  );

  const weightDiff = profile ? profile.weight - profile.targetWeight : 0;
  const progressPercent = profile
    ? Math.max(0, Math.min(100, (1 - Math.abs(weightDiff) / 10) * 100))
    : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayWorkedOut = workoutMap.has(today);

  return (
    <div className="container max-w-5xl py-8 px-4 space-y-8 pb-32">
      {/* Welcome & Quick Recommendation */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Fitness Journey</h1>
          <p className="text-muted-foreground mt-1">Keep pushing toward your {profile?.targetWeight}kg goal!</p>
        </div>
        <Button
          onClick={() => navigate('/suggestions')}
          className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get AI Suggestions
        </Button>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Workouts</p>
            <p className="text-2xl font-bold">{totalWorkouts}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="text-2xl font-bold">{(totalCalories / 1000).toFixed(1)}k</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weight</p>
            <p className="text-2xl font-bold">{profile?.weight}kg</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Badges</p>
            <p className="text-2xl font-bold">{totalWorkouts >= 1 ? 1 : 0}</p>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Calendar Heatmap Section */}
          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Training Activity</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                    else setCalMonth(m => m - 1);
                  }}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                    else setCalMonth(m => m + 1);
                  }}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <h4 className="text-sm font-semibold min-w-[100px] text-right">
                  {MONTHS[calMonth]} {calYear}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {DAYS.map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`pad-${i}`} className="aspect-square" />;
                const level = getHeatmapLevel(day);
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === today;
                const isSunday = level === -1;

                const workout = workoutMap.get(dateStr);
                const exCount = workout?.exercises.length ?? 0;

                return (
                  <button
                    key={i}
                    onClick={() => !isSunday && setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative group
                      ${isSunday ? 'bg-muted/30 text-muted-foreground/30 cursor-default' : 'cursor-pointer hover:scale-110'}
                      ${!isSunday && level === 0 ? 'bg-secondary/50 text-muted-foreground' : ''}
                      ${level === 1 ? 'bg-primary/20 text-foreground border border-primary/30' : ''}
                      ${level === 2 ? 'bg-primary/40 text-foreground border border-primary/40' : ''}
                      ${level === 3 ? 'bg-primary/60 text-primary-foreground font-bold' : ''}
                      ${level === 4 ? 'bg-primary text-primary-foreground font-bold shadow-lg' : ''}
                      ${isToday ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''}
                      ${selectedDay === dateStr ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110' : ''}
                    `}
                  >
                    <span className="text-xs">{isSunday ? 'R' : day}</span>
                    {exCount > 0 && (
                      <span className="text-[8px] font-bold mt-0.5 opacity-80">{exCount}ex</span>
                    )}
                    {level > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 text-[10px] text-muted-foreground">
              <span>Rest</span>
              <div className="w-3 h-3 rounded-sm bg-muted/30" />
              <span>Activity</span>
              <div className="w-3 h-3 rounded-sm bg-primary/20" />
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
          </section>

          {/* Detailed View Modal (Animated) */}
          <AnimatePresence>
            {selectedDay && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-2xl p-6 border-l-4 border-primary bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        {selectedDay}
                      </h3>
                      {selectedWorkout && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {selectedWorkout.exercises.length} exercise{selectedWorkout.exercises.length !== 1 ? 's' : ''} completed
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedWorkout ? (
                    <>
                      {/* Exercise name pills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedWorkout.exercises.map((ex, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold">
                            <Dumbbell className="w-3 h-3" />
                            {ex.type}
                          </span>
                        ))}
                      </div>
                      {/* Detailed exercise cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedWorkout.exercises.map((ex, i) => (
                          <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Dumbbell className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-bold text-sm">{ex.type}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-xs">
                              {Object.entries(ex.data).map(([k, v]) => (
                                v !== 0 && v !== '' && (
                                  <Badge key={k} variant="secondary" className="capitalize text-[10px]">
                                    {k}: {v}
                                  </Badge>
                                )
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground bg-background/50 rounded-xl border-dashed border-2">
                      <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No training sessions found for this date.
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Goal Progress Card */}
          <section className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-primary">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Goal Progress</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">To Target</span>
                <span className="font-bold text-primary">{Math.abs(weightDiff)} kg left</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-[10px] text-muted-foreground text-center">
                Initial: {profile?.weight}kg → Target: {profile?.targetWeight}kg
              </p>
            </div>

            <div className="pt-4 border-t flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-tight">Current Health Index</p>
                <p className="font-bold text-sm">Optimal Recovery</p>
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">Streak</p>
              <div className="text-2xl font-display font-black text-primary">3 Days</div>
            </div>
            <div className="bg-card border rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">BMI</p>
              <div className="text-2xl font-display font-black text-foreground">
                {profile ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : '--'}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Persistent FAB */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none"
      >
        <Button
          onClick={() => navigate('/workout')}
          className={`h-16 px-10 rounded-full font-bold text-lg shadow-2xl transition-all hover:scale-105 pointer-events-auto group ${todayWorkedOut
            ? 'bg-secondary text-muted-foreground border border-border'
            : 'bg-primary text-primary-foreground bg-glow transition-all duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
            }`}
        >
          {todayWorkedOut ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <Plus className="w-5 h-5 rotate-45" />
              </div>
              <span>Session Logged</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </div>
              <span>Log New Session</span>
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
