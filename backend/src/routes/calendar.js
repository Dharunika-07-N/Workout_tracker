const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/calendar?month=2026-02
router.get('/', async (req, res) => {
  const { month } = req.query; // format YYYY-MM or date range
  try {
    let start, end;
    if (month) {
      const parts = month.split('-');
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      start = new Date(Date.UTC(y, m, 1));
      end = new Date(Date.UTC(y, m + 1, 1));
    } else {
      // default to current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    const sessions = await prisma.workoutSession.findMany({ where: { userId: req.user.id, date: { gte: start, lt: end } }, select: { date: true, status: true, totalDurationMinutes: true, totalCaloriesBurned: true, exercises: { select: { id: true } } } });
    const result = sessions.map(s => ({ date: s.date.toISOString().slice(0, 10), status: s.status, total_duration: s.totalDurationMinutes, calories: s.totalCaloriesBurned, exercises_count: s.exercises.length }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:date', async (req, res) => {
  const date = req.params.date; // YYYY-MM-DD
  try {
    const session = await prisma.workoutSession.findFirst({ where: { userId: req.user.id, date: new Date(date) }, include: { exercises: { include: { exercise: true } }, healthFeedback: true } });
    if (!session) return res.status(404).json({ message: 'No workout on this date' });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
