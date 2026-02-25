import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Dumbbell, Clock, Flame, TrendingUp } from 'lucide-react';

interface Suggestion {
  exercise: string;
  description: string;
  duration: string;
  calories: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const generateSuggestions = (profile: { age: number; gender: string; weight: number; height: number; equipment: string[] }): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const { equipment, age, weight } = profile;

  if (equipment.includes('Treadmill')) {
    suggestions.push({
      exercise: 'Incline Walking',
      description: `${age < 30 ? 'Power walk' : 'Moderate walk'} at 12% incline to maximize calorie burn without joint stress.`,
      duration: `${age < 30 ? '30' : '20'} min`,
      calories: `${Math.round(weight * 4.5)}`,
      difficulty: age < 30 ? 'Medium' : 'Easy',
    });
  }
  if (equipment.includes('Dumbbells')) {
    suggestions.push({
      exercise: 'Dumbbell Full Body',
      description: 'Compound movements: goblet squats, overhead press, bent-over rows. 4 sets x 10 reps each.',
      duration: '40 min',
      calories: `${Math.round(weight * 5)}`,
      difficulty: 'Medium',
    });
  }
  if (equipment.includes('Cycling')) {
    suggestions.push({
      exercise: 'HIIT Cycling',
      description: '30s sprint, 30s recovery intervals. Great for cardiovascular endurance.',
      duration: '25 min',
      calories: `${Math.round(weight * 6)}`,
      difficulty: 'Hard',
    });
  }
  if (equipment.includes('Bench Press')) {
    suggestions.push({
      exercise: 'Progressive Overload Bench',
      description: 'Start at 60% 1RM, increase by 5% each set. 5 sets x 5 reps for strength gains.',
      duration: '35 min',
      calories: `${Math.round(weight * 3.5)}`,
      difficulty: 'Hard',
    });
  }
  if (equipment.includes('Rowing Machine')) {
    suggestions.push({
      exercise: 'Steady-State Row',
      description: 'Maintain 24-28 strokes/min for endurance building. Focus on form.',
      duration: '20 min',
      calories: `${Math.round(weight * 5.5)}`,
      difficulty: 'Medium',
    });
  }

  // Fill with general if needed
  if (suggestions.length < 3) {
    suggestions.push({
      exercise: 'Bodyweight Circuit',
      description: 'Push-ups, squats, lunges, planks. 3 rounds with minimal rest.',
      duration: '25 min',
      calories: `${Math.round(weight * 4)}`,
      difficulty: 'Easy',
    });
  }

  return suggestions.slice(0, 4);
};

const difficultyColor: Record<string, string> = {
  Easy: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  Hard: 'bg-destructive/20 text-destructive',
};

const SuggestionsPage = () => {
  const { profile } = useAppState();
  const navigate = useNavigate();

  if (!profile) return null;

  const suggestions = generateSuggestions(profile);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">AI Suggestions</h1>
          <p className="text-xs text-muted-foreground">Personalized for your profile</p>
        </div>
        <Sparkles className="w-5 h-5 text-primary ml-auto" />
      </div>

      {/* Profile Summary */}
      <div className="px-4 mb-6">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Based on your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {profile.age}y • {profile.gender} • {profile.weight}kg → {profile.targetWeight}kg
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="px-4 space-y-4">
        {suggestions.map((s, i) => (
          <motion.div
            key={s.exercise}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{s.exercise}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[s.difficulty]}`}>
                {s.difficulty}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration}</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3" />~{s.calories} kcal</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 mt-8">
        <p className="text-xs text-center text-muted-foreground">
          💡 Connect to Lovable Cloud for real AI-powered suggestions that adapt to your progress
        </p>
      </div>
    </div>
  );
};

export default SuggestionsPage;
