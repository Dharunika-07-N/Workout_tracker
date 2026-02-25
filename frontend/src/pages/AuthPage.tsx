import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppState } from '@/context/AppContext';
import { Dumbbell, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup, authError } = useAppState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4"
          >
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            IRON<span className="text-gradient-primary">PULSE</span>
          </h1>
          <p className="text-muted-foreground mt-2">Track. Train. Transform.</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-secondary rounded-xl p-1 mb-8">
          {['Sign In', 'Sign Up'].map((label, i) => (
            <button
              key={label}
              onClick={() => setIsLogin(i === 0)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${(i === 0 ? isLogin : !isLogin)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-11 h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
                disabled={submitting}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-11 h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                required
                disabled={submitting}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2 order-last" />
              )}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </motion.form>
        </AnimatePresence>

        {!isLogin && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center mt-6"
          >
            By signing up, you agree to our Terms of Service
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
