import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppState } from '@/context/AppContext';
import { ChevronRight, ChevronLeft, Ruler, Weight, Calendar, User, Target, Dumbbell } from 'lucide-react';

const EQUIPMENT_LIST = [
  'Treadmill', 'Cycling', 'Elliptical', 'Rowing Machine',
  'Dumbbells', 'Barbell', 'Bench Press', 'Leg Press',
  'Pull-up Bar', 'Cable Machine', 'Kettlebell', 'Resistance Bands',
  'Smith Machine', 'Lat Pulldown', 'Battle Ropes', 'Medicine Ball',
];

const OnboardingPage = () => {
  const { setProfile, completeOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [targetWeight, setTargetWeight] = useState(65);

  const totalSteps = 6;

  const toggleEquipment = (eq: string) => {
    setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);
  };

  const handleComplete = () => {
    setProfile({ height, weight, age, gender, targetWeight, equipment });
    completeOnboarding();
  };

  const canProceed = () => {
    if (step === 4) return equipment.length > 0;
    return true;
  };

  const steps = [
    {
      icon: <Ruler className="w-8 h-8" />,
      title: 'How tall are you?',
      subtitle: 'This helps us personalize your workouts',
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-display font-bold text-foreground">
            {height}<span className="text-2xl text-muted-foreground ml-1">cm</span>
          </div>
          <Input
            type="range"
            min={120}
            max={220}
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full h-2 accent-primary bg-secondary"
          />
          <div className="flex justify-between w-full text-sm text-muted-foreground">
            <span>120 cm</span><span>220 cm</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Weight className="w-8 h-8" />,
      title: 'Current weight?',
      subtitle: "We'll track your progress from here",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-display font-bold text-foreground">
            {weight}<span className="text-2xl text-muted-foreground ml-1">kg</span>
          </div>
          <Input
            type="range"
            min={30}
            max={200}
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full h-2 accent-primary bg-secondary"
          />
          <div className="flex justify-between w-full text-sm text-muted-foreground">
            <span>30 kg</span><span>200 kg</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'How old are you?',
      subtitle: 'Age helps us calibrate intensity',
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-display font-bold text-foreground">{age}</div>
          <Input
            type="range"
            min={14}
            max={80}
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            className="w-full h-2 accent-primary bg-secondary"
          />
          <div className="flex justify-between w-full text-sm text-muted-foreground">
            <span>14</span><span>80</span>
          </div>
        </div>
      ),
    },
    {
      icon: <User className="w-8 h-8" />,
      title: 'Gender',
      subtitle: 'Helps us customize recommendations',
      content: (
        <div className="flex gap-3">
          {(['male', 'female', 'other'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 py-4 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                gender === g
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: 'Your equipment',
      subtitle: 'Select everything available to you',
      content: (
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {EQUIPMENT_LIST.map(eq => (
            <button
              key={eq}
              onClick={() => toggleEquipment(eq)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                equipment.includes(eq)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Target weight?',
      subtitle: "What's your goal?",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-display font-bold text-foreground">
            {targetWeight}<span className="text-2xl text-muted-foreground ml-1">kg</span>
          </div>
          <Input
            type="range"
            min={30}
            max={200}
            value={targetWeight}
            onChange={e => setTargetWeight(Number(e.target.value))}
            className="w-full h-2 accent-primary bg-secondary"
          />
          <div className="flex justify-between w-full text-sm text-muted-foreground">
            <span>30 kg</span><span>200 kg</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? 'w-8 bg-primary' : 'w-4 bg-secondary'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
              {steps[step].icon}
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">{steps[step].title}</h2>
            <p className="text-muted-foreground mt-1">{steps[step].subtitle}</p>
          </div>

          {steps[step].content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-10 w-full max-w-md">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            className="h-12 px-6 border-border text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={() => step < totalSteps - 1 ? setStep(s => s + 1) : handleComplete()}
          disabled={!canProceed()}
          className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-primary disabled:opacity-50"
        >
          {step < totalSteps - 1 ? 'Continue' : "Let's Go!"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
