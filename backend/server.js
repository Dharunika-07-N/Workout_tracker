const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Health check (no auth needed) ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Load middleware ───────────────────────────────────────────────────────────
const authMiddleware = require('./src/middleware/auth');

// ─── Load routes ──────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth');
const equipmentRoutes = require('./src/routes/equipment');
const profileRoutes = require('./src/routes/profile');
const workoutsRoutes = require('./src/routes/workouts');
const calendarRoutes = require('./src/routes/calendar');
const analyticsRoutes = require('./src/routes/analytics');
const notificationsRoutes = require('./src/routes/notifications');
const recommendationsRoutes = require('./src/routes/recommendations');

// ─── Mount routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);                         // login/register public; /me has its own auth guard
app.use('/api/equipment', equipmentRoutes);                    // read-only, public is fine
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/workouts', authMiddleware, workoutsRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);
app.use('/api/recommendations', authMiddleware, recommendationsRoutes);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const notificationScheduler = require('./src/services/notificationScheduler');
  notificationScheduler.startScheduler();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`✅  Backend listening on http://localhost:${PORT}`);
    console.log(`📦  Database: ${process.env.DATABASE_URL}`);
  });
}

module.exports = app;
