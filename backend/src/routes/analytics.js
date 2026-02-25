const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/analytics/progress — summary stats for the logged-in user
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.id;
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const sessions = await prisma.workoutSession.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const weeklyCompletionPercent = Math.round((completed / Math.max(1, total)) * 100);
    const caloriesLast30Days = sessions.reduce((sum, s) => sum + (s.totalCaloriesBurned || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.totalDurationMinutes || 0), 0);

    // Build weekly buckets (last 4 weeks)
    const weekly = [];
    for (let w = 3; w >= 0; w--) {
      const wStart = new Date();
      wStart.setDate(wStart.getDate() - (w + 1) * 7);
      const wEnd = new Date();
      wEnd.setDate(wEnd.getDate() - w * 7);
      const wSessions = sessions.filter(s => s.date >= wStart && s.date < wEnd);
      weekly.push({
        week: `Week ${4 - w}`,
        workouts: wSessions.length,
        calories: wSessions.reduce((sum, s) => sum + (s.totalCaloriesBurned || 0), 0),
      });
    }

    res.json({
      total_workouts: total,
      completed,
      weekly_completion_percent: weeklyCompletionPercent,
      calories_last_30_days: Math.round(caloriesLast30Days),
      total_minutes: totalMinutes,
      weekly_breakdown: weekly,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
