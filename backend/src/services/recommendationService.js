const prisma = require('../prismaClient');

async function generateDailyRecommendation(userId, dateStr){
  // Simple rule-based demo: pick 3 exercises from DB filtered by equipment
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const equipments = await prisma.userEquipment.findMany({ where: { userId } });
  const equipmentIds = equipments.map(e => e.equipmentId);

  // naive: pick any 3 exercises
  const exercises = await prisma.exercise.findMany({ take: 10 });
  const sample = exercises.slice(0,3).map((ex, i) => ({ id: ex.id, name: ex.name || 'Exercise', sets: 3, reps: 10 + i*2 }));
  const recommendation = { user_id: userId, date: dateStr, exercises: sample };
  await prisma.mLRecommendation.create({ data: { userId, recommendedExercises: recommendation, reasoning: 'Rule-based sample', userAccepted: null } }).catch(()=>{});
  return recommendation;
}

module.exports = { generateDailyRecommendation };
