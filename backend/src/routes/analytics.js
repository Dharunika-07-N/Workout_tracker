const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.get('/progress', async (req, res) => {
  try{
    // weekly completion rate and calories burned last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sessions = await prisma.workoutSession.findMany({ where: { date: { gte: since } } });
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const weekly = Math.round((completed / Math.max(1,total)) * 100);
    const calories = sessions.reduce((sum, s) => sum + (s.totalCaloriesBurned || 0), 0);
    res.json({ total_workouts: total, completed, weekly_completion_percent: weekly, calories_last_30_days: calories });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
