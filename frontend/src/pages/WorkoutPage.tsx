import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState, Exercise, HealthSymptom } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Plus, Check, Trash2,
  AlertTriangle, Brain, Zap
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const EXERCISE_TEMPLATES: Record<string, { label: string; fields: { key: string; label: string; unit: string }[] }> = {
  Treadmill: {
    label: 'Treadmill',
    fields: [
      { key: 'time', label: 'Time', unit: 'min' },
      { key: 'speed', label: 'Speed', unit: 'km/h' },
      { key: 'distance', label: 'Distance', unit: 'km' },
      { key: 'inclination', label: 'Incline', unit: '%' },
      { key: 'calories', label: 'Calories', unit: 'kcal' },
    ],
  },
  Cycling: {
    label: 'Cycling',
    fields: [
      { key: 'time', label: 'Time', unit: 'min' },
      { key: 'distance', label: 'Distance', unit: 'km' },
      { key: 'calories', label: 'Calories', unit: 'kcal' },
    ],
  },
  Dumbbells: {
    label: 'Dumbbells',
    fields: [
      { key: 'sets', label: 'Sets', unit: '' },
      { key: 'reps', label: 'Reps', unit: '' },
      { key: 'weight', label: 'Weight', unit: 'kg' },
    ],
  },
  'Bench Press': {
    label: 'Bench Press',
    fields: [
      { key: 'sets', label: 'Sets', unit: '' },
      { key: 'reps', label: 'Reps', unit: '' },
      { key: 'weight', label: 'Weight', unit: 'kg' },
    ],
  },
  Elliptical: {
    label: 'Elliptical',
    fields: [
      { key: 'time', label: 'Time', unit: 'min' },
      { key: 'calories', label: 'Calories', unit: 'kcal' },
    ],
  },
  'Rowing Machine': {
    label: 'Rowing Machine',
    fields: [
      { key: 'time', label: 'Time', unit: 'min' },
      { key: 'distance', label: 'Distance', unit: 'm' },
      { key: 'calories', label: 'Calories', unit: 'kcal' },
    ],
  },
};

const SYMPTOM_TYPES: { type: HealthSymptom['type']; label: string; icon: React.ReactNode }[] = [
  { type: 'dizziness', label: 'Dizziness', icon: <Zap className="w-4 h-4" /> },
  { type: 'pain', label: 'Pain', icon: <AlertTriangle className="w-4 h-4" /> },
  { type: 'stress', label: 'Stress', icon: <Brain className="w-4 h-4" /> },
];

const WorkoutPage = () => {
  const { profile, addWorkout } = useAppState();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<(Exercise & { id: number })[]>([]);
  const [symptoms, setSymptoms] = useState<HealthSymptom[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [nextId, setNextId] = useState(0);

  const isSunday = new Date().getDay() === 0;

  const addExercise = (type: string) => {
    const template = EXERCISE_TEMPLATES[type];
    if (!template) return;
    const data: Record<string, number | string> = {};
    template.fields.forEach(f => { data[f.key] = 0; });
    setExercises(prev => [...prev, { id: nextId, type, data }]);
    setNextId(n => n + 1);
    setShowExercisePicker(false);
  };

  const updateExerciseField = (id: number, key: string, value: string) => {
    setExercises(prev => prev.map(ex =>
      ex.id === id ? { ...ex, data: { ...ex.data, [key]: Number(value) || 0 } } : ex
    ));
  };

  const removeExercise = (id: number) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const toggleSymptom = (type: HealthSymptom['type']) => {
    setSymptoms(prev => {
      const exists = prev.find(s => s.type === type);
      if (exists) return prev.filter(s => s.type !== type);
      return [...prev, { type, severity: 2 }];
    });
  };

  const updateSymptomSeverity = (type: HealthSymptom['type'], severity: number) => {
    setSymptoms(prev => prev.map(s => s.type === type ? { ...s, severity } : s));
  };

  const handleComplete = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const workoutData = {
      id: `workout-${Date.now()}`,
      date: today,
      exercises: exercises.map(({ type, data }) => ({ type, data })),
      symptoms,
      completed: true,
    };

    try {
      // The backend returns achievements in the response
      const response: any = await api.workouts.log({
        date: workoutData.date,
        exercises: workoutData.exercises,
        symptoms: workoutData.symptoms,
      });

      if (response.achievements && response.achievements.length > 0) {
        response.achievements.forEach((ach: any) => {
          toast.success(ach.title, {
            description: ach.message,
            icon: <Zap className="w-5 h-5 text-yellow-500" />,
            duration: 5000,
          });
        });
      }
    } catch (err) {
      console.error('Failed to log achievement:', err);
    }

    addWorkout(workoutData);
    setCompleted(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#84cc16', '#22c55e', '#eab308', '#ffffff'],
    });
  }, [exercises, symptoms, addWorkout]);

  if (isSunday) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😴</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Rest Day</h2>
          <p className="text-muted-foreground mb-8">It's Sunday — your body needs recovery!</p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-border text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 glow-primary">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">Crushed It! 💪</h2>
          <p className="text-muted-foreground mb-2">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} logged today
          </p>
          <p className="text-sm text-primary mb-8">Keep the streak going!</p>
          <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const availableEquipment = profile?.equipment || Object.keys(EXERCISE_TEMPLATES);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Log Workout</h1>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Exercises */}
      <div className="px-4 space-y-4 mb-6">
        <AnimatePresence>
          {exercises.map(ex => {
            const template = EXERCISE_TEMPLATES[ex.type];
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{ex.type}</h3>
                  <button onClick={() => removeExercise(ex.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {template?.fields.map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        {field.label} {field.unit && `(${field.unit})`}
                      </label>
                      <Input
                        type="number"
                        value={ex.data[field.key] || ''}
                        onChange={e => updateExerciseField(ex.id, field.key, e.target.value)}
                        className="h-10 bg-secondary border-border text-foreground"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Exercise */}
        <AnimatePresence>
          {showExercisePicker ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass-card rounded-2xl p-4"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">Choose Exercise</h4>
              <div className="flex flex-wrap gap-2">
                {availableEquipment.filter(eq => EXERCISE_TEMPLATES[eq]).map(eq => (
                  <button
                    key={eq}
                    onClick={() => addExercise(eq)}
                    className="px-4 py-2 rounded-full bg-secondary text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowExercisePicker(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Health Check */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Health Check</h3>
        <div className="flex gap-2 mb-3">
          {SYMPTOM_TYPES.map(s => {
            const active = symptoms.some(sym => sym.type === s.type);
            return (
              <button
                key={s.type}
                onClick={() => toggleSymptom(s.type)}
                className={`flex-1 py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${active
                  ? 'bg-warning/20 text-warning border border-warning/30'
                  : 'bg-secondary text-muted-foreground'
                  }`}
              >
                {s.icon}
                {s.label}
              </button>
            );
          })}
        </div>
        {symptoms.map(s => (
          <div key={s.type} className="mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="capitalize">{s.type} severity</span>
              <span>{s.severity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={s.severity}
              onChange={e => updateSymptomSeverity(s.type, Number(e.target.value))}
              className="w-full h-1.5 accent-warning bg-secondary rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Complete Button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
        <Button
          onClick={handleComplete}
          disabled={exercises.length === 0}
          className="w-full max-w-md h-14 rounded-2xl font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-40 disabled:shadow-none"
        >
          <Check className="w-5 h-5 mr-2" />
          Complete Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutPage;
