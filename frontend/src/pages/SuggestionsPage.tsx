import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Sparkles, Dumbbell, Clock, Flame,
  TrendingUp, Play, Pause, RotateCcw, CheckCircle2,
  Video, Info, Trophy, BrainCircuit
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AIExercise {
  name: string;
  type: string;
  sets: number;
  reps: number;
  duration_minutes: number;
  description: string;
  video_demo_prompt: string;
  calories_estimate: number;
}

const AISuggestionsPage = () => {
  const { profile } = useAppState();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(true);

  // Session State
  const [activeSession, setActiveSession] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoGenStep, setVideoGenStep] = useState(0);

  // Selection Logic
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<AIExercise[]>([]);

  useEffect(() => {
    const fetchAIWorkout = async () => {
      try {
        const data = await api.recommendations.daily();
        setExercises(data.exercises);
        setReasoning(data.reasoning);
        // Initially select all
        setSelectedIndices(data.exercises.map((_: any, i: number) => i));
      } catch (err) {
        toast.error("AI couldn't reach the server. Using local plan.");
      } finally {
        setLoading(false);
      }
    };
    fetchAIWorkout();
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      toast.success("Set complete!", { icon: <CheckCircle2 className="text-primary" /> });
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startVideoGeneration = () => {
    setIsVideoGenerating(true);
    setVideoGenStep(0);

    const steps = [
      "Analyzing biomechanics...",
      "Simulating joint load...",
      "Synthesizing motion path...",
      "Finalizing HD preview..."
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setVideoGenStep(step);
      } else {
        clearInterval(interval);
        setIsVideoGenerating(false);
      }
    }, 800);
  };

  const toggleSelection = (idx: number) => {
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const startSession = () => {
    if (selectedIndices.length === 0) {
      toast.error("Please select at least one exercise.");
      return;
    }
    const finalEx = exercises.filter((_, i) => selectedIndices.includes(i));
    setFilteredExercises(finalEx);
    setIsSelecting(false);

    // Reset session state
    const firstEx = finalEx[0];
    setCurrentIdx(0);
    setTimeLeft((firstEx.duration_minutes || 1) * 60);
    setIsActive(true);
    setActiveSession(true);
    startVideoGeneration();
  };

  const startExercise = (idx: number) => {
    const ex = exercises[idx];
    setFilteredExercises([ex]);
    setCurrentIdx(0);
    setTimeLeft((ex.duration_minutes || 1) * 60);
    setIsActive(true);
    setActiveSession(true);
    startVideoGeneration();
  };

  const nextExercise = () => {
    if (currentIdx < filteredExercises.length - 1) {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      const ex = filteredExercises[next];
      setTimeLeft((ex.duration_minutes || 1) * 60);
      setIsActive(false);
      startVideoGeneration();
    } else {
      setSessionComplete(true);
      setActiveSession(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
          AI Trainer is planning your session...
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">Analyzing your profile & goals with Gemini</p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
          <p className="text-muted-foreground mb-8">AI Trainer: "Great form today. You're closer to your goal!"</p>
          <Button onClick={() => navigate('/')} className="px-8 py-6 rounded-2xl text-lg font-bold">
            Done
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentExercise = filteredExercises[currentIdx];

  return (
    <div className="min-h-screen bg-background pb-12">
      <AnimatePresence mode="wait">
        {activeSession ? (
          <motion.div
            key="active"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="p-4 md:p-8 flex flex-col min-h-screen"
          >
            {/* Active Session UI */}
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" onClick={() => setActiveSession(false)}>
                <ArrowLeft className="w-5 h-5 mr-2" /> Exit Session
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase">Step {currentIdx + 1} of {filteredExercises.length}</span>
                <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${((currentIdx + 1) / filteredExercises.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Video Demo Section */}
            <div className="aspect-video bg-black rounded-3xl mb-6 relative overflow-hidden shadow-2xl border-2 border-primary/20 group">
              <AnimatePresence mode="wait">
                {isVideoGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-md z-10"
                  >
                    <div className="w-16 h-16 relative mb-6">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                      <Video className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Generating AI Preview</h3>
                      <p className="text-xs text-primary font-mono uppercase tracking-[0.2em] animate-pulse">
                        {[
                          "Analyzing biomechanics...",
                          "Simulating joint load...",
                          "Synthesizing motion path...",
                          "Finalizing HD preview..."
                        ][videoGenStep]}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 group"
                  >
                    <img
                      src="/ai-demo.png"
                      className="w-full h-full object-cover opacity-60 mix-blend-screen"
                      alt="AI Visualization"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/30 backdrop-blur-sm group-hover:scale-110 transition-transform cursor-pointer">
                        <Play className="w-10 h-10 text-primary fill-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">AI Motion Guide: {currentExercise.name}</h3>
                      <p className="text-sm text-gray-300 max-w-sm line-clamp-2">
                        {currentExercise.video_demo_prompt}
                      </p>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Badge className="bg-black/50 text-[10px] border-white/10 backdrop-blur">4K AI RENDER</Badge>
                        <Badge className="bg-black/50 text-[10px] border-white/10 backdrop-blur">BIOMECH-V4</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-white/50 hover:text-white" onClick={startVideoGeneration}>
                        Regenerate Demo
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fake AI Watermark */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] text-white/70 z-20">
                IRONPULSE-ENGINE-V2
              </div>
            </div>

            {/* Stats & Timer */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center justify-center border-b-4 border-primary">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">Current Target</p>
                <h2 className="text-4xl font-display font-black">
                  {currentExercise.type === 'cardio' ? 'GOAL' : `${currentExercise.sets}x${currentExercise.reps}`}
                </h2>
                <p className="text-xs text-primary mt-1 font-bold">REMAINING</p>
              </div>

              <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center justify-center border-b-4 border-orange-500">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">Timer</p>
                <h2 className={`text-4xl font-display font-black ${timeLeft < 10 && isActive ? 'text-destructive animate-pulse' : ''}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </h2>
                <div className="flex gap-2 mt-4">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-border" onClick={() => setIsActive(!isActive)}>
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-border" onClick={() => setTimeLeft((currentExercise.duration_minutes || 1) * 60)}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6 rounded-2xl grow relative group">
              <div className="absolute top-4 right-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity">
                <Info className="w-5 h-5" />
              </div>
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Trainer Notes
              </h4>
              <p className="text-muted-foreground leading-relaxed">{currentExercise.description}</p>
            </div>

            {/* Session Controls */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={nextExercise}
                className="grow h-16 rounded-2xl text-lg font-bold bg-primary shadow-lg shadow-primary/20"
              >
                {currentIdx === filteredExercises.length - 1 ? 'Finish Session' : 'Next Exercise'}
              </Button>
            </div>
          </motion.div>
        ) : isSelecting ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 md:p-8 max-w-4xl mx-auto"
          >
            {/* Selection Header */}
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setIsSelecting(false)}>
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Personalize Your Comfort</h1>
                <p className="text-sm text-muted-foreground">Deselect any exercises you don't feel comfortable doing today.</p>
              </div>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, i) => {
                const isSelected = selectedIndices.includes(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleSelection(i)}
                    className={`glass-card p-5 rounded-2xl transition-all cursor-pointer border-2 ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent opacity-60 grayscale hover:grayscale-0'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                          }`}>
                          <CheckCircle2 className={`w-6 h-6 ${isSelected ? 'opacity-100' : 'opacity-20'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{ex.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge className="bg-primary/10 text-[10px] text-primary hover:bg-primary/10">{ex.type}</Badge>
                            <Badge className="bg-secondary text-[10px] text-muted-foreground hover:bg-secondary">
                              {ex.type === 'cardio' ? `${ex.duration_minutes}m` : `${ex.sets}x${ex.reps}`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Comfort Level</p>
                        <p className="text-sm font-bold text-primary">High</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={startSession}
              disabled={selectedIndices.length === 0}
              className="w-full h-16 rounded-2xl mt-8 text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl transition-all active:scale-95"
            >
              Confirm & Start {selectedIndices.length} Exercises
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              AI Trainer: "I will adjust the rest of the plan based on these choices."
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Daily Plan
                </h1>
                <p className="text-sm text-muted-foreground">Strategically crafted by IronPulse AI</p>
              </div>
            </div>

            {/* AI Insight */}
            <div className="glass-card p-6 rounded-2xl mb-8 border-l-4 border-primary bg-primary/5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-primary mb-2">AI Trainer's reasoning</h3>
                  <p className="text-sm leading-relaxed text-foreground/80 italic">"{reasoning}"</p>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              {exercises.map((ex, i) => (
                <div key={i} className="glass-card p-5 rounded-2xl group hover:bg-secondary/50 transition-all border border-transparent hover:border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{ex.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{ex.type} • AI Designed</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => startExercise(i)}
                      className="rounded-full h-10 px-6 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Start
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background/50 p-2 rounded-lg text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Target</p>
                      <p className="font-bold text-sm">
                        {ex.type === 'cardio' ? `${ex.duration_minutes}m` : `${ex.sets}x${ex.reps}`}
                      </p>
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Intensity</p>
                      <p className="font-bold text-sm">AI-Optimized</p>
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">Burn</p>
                      <p className="font-bold text-sm flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" /> {ex.calories_estimate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setIsSelecting(true)}
              className="w-full h-16 rounded-2xl mt-8 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
            >
              Customize & Start Session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple reusable badge
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

export default AISuggestionsPage;
