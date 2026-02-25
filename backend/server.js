const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount modular routes
const authRoutes = require('./src/routes/auth');
const profileRoutes = require('./src/routes/profile');
const equipmentRoutes = require('./src/routes/equipment');
const recommendationsRoutes = require('./src/routes/recommendations');
const authMiddleware = require('./src/middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/recommendations', authMiddleware, recommendationsRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
const workoutsRoutes = require('./src/routes/workouts');
app.use('/api/workouts', authMiddleware, workoutsRoutes);

const calendarRoutes = require('./src/routes/calendar');
const analyticsRoutes = require('./src/routes/analytics');
const notificationsRoutes = require('./src/routes/notifications');
const notificationScheduler = require('./src/services/notificationScheduler');

app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

// Export app for testing; start server & scheduler when run directly
if(require.main === module){
  // Start notification scheduler (runs in background)
  notificationScheduler.startScheduler();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
}

module.exports = app;
