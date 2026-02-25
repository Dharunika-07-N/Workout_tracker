const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const recService = require('../services/recommendationService');

// GET /api/workouts — list all past sessions for user (newest first)
router.get('/', async (req, res) => {
  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workouts/today — get or generate today's session
router.get('/today', async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  try {
    let session = await prisma.workoutSession.findFirst({
      where: { userId, date: { gte: start, lt: end } },
      include: { exercises: { include: { exercise: true } } },
    });
    if (!session) {
      const dateStr = today.toISOString().slice(0, 10);
      const rec = await recService.generateDailyRecommendation(userId, dateStr);
      session = await prisma.workoutSession.create({
        data: { userId, date: start, status: 'planned' },
      });
      for (let idx = 0; idx < rec.exercises.length; idx++) {
        const e = rec.exercises[idx];
        await prisma.workoutExercise.create({
          data: {
            workoutSessionId: session.id,
            exerciseId: e.id || '',
            orderIndex: idx,
            sets: e.sets || null,
            reps: e.reps || null,
            durationMinutes: e.duration_minutes || null,
          },
        }).catch(() => { });
      }
      session = await prisma.workoutSession.findUnique({
        where: { id: session.id },
        include: { exercises: { include: { exercise: true } } },
      });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workouts — create a workout session manually (used by frontend log-workout)
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { date, exercises, symptoms } = req.body;
  // exercises: [{ type, sets, reps, weightKg, durationMinutes, distanceKm, speedKmh, inclinePercent, caloriesBurned }]
  // symptoms:  [{ type, severity, location }]
  try {
    const sessionDate = date ? new Date(date) : new Date();

    // Create session
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        date: sessionDate,
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Find or match exercises by name/type
    let totalCalories = 0;
    let totalMinutes = 0;

    for (let idx = 0; idx < (exercises || []).length; idx++) {
      const ex = exercises[idx];
      // Try to find matching exercise in DB
      let dbExercise = await prisma.exercise.findFirst({
        where: { name: { contains: ex.type } },
      });
      // If not found, create a minimal exercise record
      if (!dbExercise) {
        dbExercise = await prisma.exercise.create({
          data: {
            name: ex.type,
            category: 'general',
            equipmentRequired: ex.type,
            difficulty: 'medium',
            targetMuscles: '[]',
          },
        });
      }
      const calories = Number(ex.data?.calories || ex.caloriesBurned || 0);
      const duration = Number(ex.data?.time || ex.durationMinutes || 0);
      totalCalories += calories;
      totalMinutes += duration;

      await prisma.workoutExercise.create({
        data: {
          workoutSessionId: session.id,
          exerciseId: dbExercise.id,
          orderIndex: idx,
          sets: ex.data?.sets ? Number(ex.data.sets) : null,
          reps: ex.data?.reps ? Number(ex.data.reps) : null,
          weightKg: ex.data?.weight ? Number(ex.data.weight) : null,
          durationMinutes: duration || null,
          distanceKm: ex.data?.distance ? Number(ex.data.distance) : null,
          speedKmh: ex.data?.speed ? Number(ex.data.speed) : null,
          inclinePercent: ex.data?.inclination ? Number(ex.data.inclination) : null,
          caloriesBurned: calories || null,
          completed: true,
        },
      });
    }

    // Update session totals
    await prisma.workoutSession.update({
      where: { id: session.id },
      data: {
        totalDurationMinutes: totalMinutes || null,
        totalCaloriesBurned: totalCalories || null,
      },
    });

    // Save health feedback / symptoms
    for (const sym of (symptoms || [])) {
      await prisma.healthFeedback.create({
        data: {
          workoutSessionId: session.id,
          painLevel: sym.type === 'pain' ? sym.severity : null,
          dizzinessLevel: sym.type === 'dizziness' ? sym.severity : null,
          stressLevel: sym.type === 'stress' ? sym.severity : null,
          painLocation: sym.location || null,
          notes: `${sym.type} severity ${sym.severity}/5`,
        },
      }).catch(() => { });
    }

    const full = await prisma.workoutSession.findUnique({
      where: { id: session.id },
      include: { exercises: { include: { exercise: true } }, healthFeedback: true },
    });
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workouts/:sessionId/start
router.post('/:sessionId/start', async (req, res) => {
  try {
    const s = await prisma.workoutSession.update({
      where: { id: req.params.sessionId },
      data: { status: 'in_progress' },
    });
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/workouts/:sessionId/exercises/:exerciseId — update exercise metrics
router.put('/:sessionId/exercises/:exerciseId', async (req, res) => {
  const { sessionId, exerciseId } = req.params;
  const data = req.body;
  try {
    const ex = await prisma.workoutExercise.updateMany({
      where: { workoutSessionId: sessionId, id: exerciseId },
      data,
    });
    res.json({ updated: ex.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workouts/:sessionId/complete
router.post('/:sessionId/complete', async (req, res) => {
  try {
    const exercises = await prisma.workoutExercise.findMany({
      where: { workoutSessionId: req.params.sessionId },
    });
    const totalMinutes = exercises.reduce((s, e) => s + (e.durationMinutes || 0), 0);
    const totalCalories = exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0);
    const s = await prisma.workoutSession.update({
      where: { id: req.params.sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalDurationMinutes: totalMinutes,
        totalCaloriesBurned: totalCalories,
      },
    });
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
