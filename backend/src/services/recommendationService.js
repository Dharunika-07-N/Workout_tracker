const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../prismaClient');

// Initialize Gemini if key exists
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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

  // Get user profile & equipment
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, equipment: { include: { equipment: true } } }
  });

  const equipmentNames = user.equipment.map(ue => ue.equipment.name);
  const profile = user.profile || { height: 170, weight: 70, age: 25, gender: 'other', targetWeight: 65 };

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a professional AI Fitness Trainer. 
        Create a personalized daily workout for a user with these stats:
        - Age: ${profile.age}
        - Current Weight: ${profile.weight}kg
        - Height: ${profile.height}cm
        - Gender: ${profile.gender}
        - Target Weight: ${profile.targetWeight}kg
        - Available Equipment: ${equipmentNames.length > 0 ? equipmentNames.join(', ') : 'No equipment (bodyweight only)'}

        Return a JSON object with this structure:
        {
          "exercises": [
            {
              "name": "Exercise Name",
              "type": "cardio|strength",
              "sets": number,
              "reps": number,
              "duration_minutes": number,
              "description": "Brief description",
              "video_demo_prompt": "Describe precisely how a video demo of this exercise should look for an AI video generator",
              "calories_estimate": number
            }
          ],
          "reasoning": "Why you chose this for them today"
        }
        Give 3-5 exercises. Keep it safe and effective. Output ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON if model wraps it in markdown
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);

      const aiData = JSON.parse(jsonStr);

      const recommendation = {
        user_id: userId,
        date: dateStr,
        exercises: aiData.exercises,
        reasoning: aiData.reasoning
      };

      await prisma.mLRecommendation.create({
        data: {
          userId,
          recommendedExercises: JSON.stringify(aiData.exercises),
          reasoning: aiData.reasoning,
          userAccepted: null,
        }
      }).catch(() => { });

      return recommendation;
    } catch (err) {
      console.error('Gemini AI failed, falling back to rule-based:', err);
    }
  }

  // Fallback to rule-based
  let exercises = await prisma.exercise.findMany({ take: 20 });
  if (equipmentNames.length > 0) {
    const filtered = exercises.filter(ex => equipmentNames.includes(ex.equipmentRequired));
    if (filtered.length > 0) exercises = filtered;
  }

  const sample = exercises.slice(0, 3).map((ex, i) => ({
    name: ex.name,
    type: ex.category || 'strength',
    sets: 3,
    reps: 10 + i * 2,
    duration_minutes: ex.category === 'cardio' ? 20 : null,
    description: ex.description,
    video_demo_prompt: `A tutorial video showing a person performing ${ex.name} with proper form.`,
    calories_estimate: ex.caloriesPerMin * 30
  }));

  return { user_id: userId, date: dateStr, exercises: sample, reasoning: 'Rule-based fallback' };
}

module.exports = { generateDailyRecommendation };
