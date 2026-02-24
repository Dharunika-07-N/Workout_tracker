const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const recService = require('../services/recommendationService');

// Helper to get today's date string
function todayDate(){
  return new Date().toISOString().slice(0,10);
}

// GET today's workout - generate if missing
router.get('/today', async (req, res) => {
  const userId = req.user.id;
  const date = todayDate();
  try{
    let session = await prisma.workoutSession.findFirst({ where: { userId, date: new Date(date) }, include: { exercises: true } });
    if(!session){
      // generate recommendation and create session + exercises
      const rec = await recService.generateDailyRecommendation(userId, date);
      const sessionCreate = await prisma.workoutSession.create({ data: { userId, date: new Date(date), status: 'planned' } });
      const exOps = rec.exercises.map((e, idx) => prisma.workoutExercise.create({ data: { workoutSessionId: sessionCreate.id, exerciseId: e.id || '', orderIndex: idx, sets: e.sets || null, reps: e.reps || null, durationMinutes: e.duration_minutes || null } }));
      await Promise.all(exOps);
      session = await prisma.workoutSession.findUnique({ where: { id: sessionCreate.id }, include: { exercises: true } });
    }
    res.json(session);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start workout
router.post('/:sessionId/start', async (req, res) => {
  const { sessionId } = req.params;
  try{
    const s = await prisma.workoutSession.update({ where: { id: sessionId }, data: { status: 'in_progress' } });
    res.json(s);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update exercise metrics
router.put('/:sessionId/exercises/:exerciseId', async (req, res) => {
  const { sessionId, exerciseId } = req.params;
  const data = req.body; // sets, reps, weightKg, durationMinutes, caloriesBurned, completed
  try{
    const ex = await prisma.workoutExercise.updateMany({ where: { workoutSessionId: sessionId, id: exerciseId }, data });
    res.json({ updated: ex.count });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete workout
router.post('/:sessionId/complete', async (req, res) => {
  const { sessionId } = req.params;
  try{
    const exercises = await prisma.workoutExercise.findMany({ where: { workoutSessionId: sessionId } });
    const totalMinutes = exercises.reduce((s, e) => s + (e.durationMinutes || 0), 0);
    const totalCalories = exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0);
    const s = await prisma.workoutSession.update({ where: { id: sessionId }, data: { status: 'completed', completedAt: new Date(), totalDurationMinutes: totalMinutes, totalCaloriesBurned: totalCalories } });
    res.json(s);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
