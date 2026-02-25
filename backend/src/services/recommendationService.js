const prisma = require('../prismaClient');

// Default exercises to seed if DB is empty
const DEFAULT_EXERCISES = [
  { name: 'Treadmill', category: 'cardio', equipmentRequired: 'Treadmill', difficulty: 'medium', caloriesPerMin: 10, description: 'Steady-pace run on treadmill', instructions: 'Set treadmill to 8 km/h and run for 30 minutes', targetMuscles: JSON.stringify(['legs', 'core', 'cardiovascular']) },
  { name: 'Dumbbells', category: 'strength', equipmentRequired: 'Dumbbells', difficulty: 'easy', caloriesPerMin: 5, description: 'Bicep curls with dumbbells', instructions: '3 sets of 12 reps each arm', targetMuscles: JSON.stringify(['biceps']) },
  { name: 'Bench Press', category: 'strength', equipmentRequired: 'Bench Press', difficulty: 'hard', caloriesPerMin: 7, description: 'Classic chest press on flat bench', instructions: '4 sets of 8 reps at 60% 1RM', targetMuscles: JSON.stringify(['chest', 'triceps', 'shoulders']) },
  { name: 'Cycling', category: 'cardio', equipmentRequired: 'Cycling', difficulty: 'medium', caloriesPerMin: 9, description: 'HIIT on stationary bike', instructions: '30s sprint, 30s recovery x 10', targetMuscles: JSON.stringify(['legs', 'cardiovascular']) },
  { name: 'Rowing Machine', category: 'cardio', equipmentRequired: 'Rowing Machine', difficulty: 'medium', caloriesPerMin: 8, description: 'Full-body rowing machine workout', instructions: 'Row for 20 minutes at steady pace', targetMuscles: JSON.stringify(['back', 'arms', 'core']) },
  { name: 'Elliptical', category: 'cardio', equipmentRequired: 'Elliptical', difficulty: 'easy', caloriesPerMin: 6, description: 'Low-impact elliptical session', instructions: 'Maintain 60-70 RPM for 30 minutes', targetMuscles: JSON.stringify(['legs', 'arms', 'cardiovascular']) },
];

async function seedExercisesIfEmpty() {
  const count = await prisma.exercise.count();
  if (count === 0) {
    for (const ex of DEFAULT_EXERCISES) {
      await prisma.exercise.create({ data: ex }).catch(() => { });
    }
  }
}

async function generateDailyRecommendation(userId, dateStr) {
  await seedExercisesIfEmpty();

  // Get user equipment preferences
  const userEquipment = await prisma.userEquipment.findMany({
    where: { userId },
    include: { equipment: true }
  });
  const equipmentNames = userEquipment.map(ue => ue.equipment.name);

  // Pick exercises matching user equipment (or all if none set)
  let exercises = await prisma.exercise.findMany({ take: 20 });
  if (equipmentNames.length > 0) {
    const filtered = exercises.filter(ex => equipmentNames.includes(ex.equipmentRequired));
    if (filtered.length > 0) exercises = filtered;
  }

  const sample = exercises.slice(0, 3).map((ex, i) => ({
    id: ex.id,
    name: ex.name,
    sets: 3,
    reps: 10 + i * 2,
    duration_minutes: ex.category === 'cardio' ? 20 : null,
  }));

  const recommendation = { user_id: userId, date: dateStr, exercises: sample };

  // Store recommendation (best-effort — ignore duplicate errors)
  await prisma.mLRecommendation.create({
    data: {
      userId,
      recommendedExercises: JSON.stringify(sample),
      reasoning: 'Rule-based: matched user equipment',
      userAccepted: null,
    }
  }).catch(() => { });

  return recommendation;
}

module.exports = { generateDailyRecommendation };
