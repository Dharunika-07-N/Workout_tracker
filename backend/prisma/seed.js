const prisma = require('../src/prismaClient');
const { hashPassword } = require('../src/utils/hash');

async function main() {
  console.log('Seeding database...');

  // Create demo user if not exists
  const demoEmail = 'demo@local';
  let demo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    const passwordHash = await hashPassword('password');
    demo = await prisma.user.create({ data: { email: demoEmail, passwordHash } });
    console.log('Created demo user:', demo.email);
  }

  // Create sample exercises if none
  const exCount = await prisma.exercise.count();
  if (exCount === 0) {
    const exercises = [
      { name: 'Push Ups', category: 'strength', equipment_required: [], difficulty_level: 'medium', calories_per_minute: 8.0, description: 'Classic bodyweight push ups', target_muscles: ['chest', 'triceps'] },
      { name: 'Squats', category: 'strength', equipment_required: [], difficulty_level: 'medium', calories_per_minute: 7.5, description: 'Bodyweight squats', target_muscles: ['legs', 'glutes'] },
      { name: 'Jumping Jacks', category: 'cardio', equipment_required: [], difficulty_level: 'easy', calories_per_minute: 10.0, description: 'Full body cardio', target_muscles: ['full_body'] },
      { name: 'Plank', category: 'core', equipment_required: [], difficulty_level: 'medium', calories_per_minute: 5.0, description: 'Core hold', target_muscles: ['core'] }
    ];
    for (const ex of exercises) {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          category: ex.category,
          equipmentRequired: Array.isArray(ex.equipment_required) ? ex.equipment_required.join(',') : ex.equipment_required,
          difficulty: ex.difficulty_level,
          caloriesPerMin: ex.calories_per_minute,
          description: ex.description,
          targetMuscles: Array.isArray(ex.target_muscles) ? ex.target_muscles.join(',') : ex.target_muscles
        }
      });
    }
    console.log('Seeded exercises');
  }

  // Create basic equipment if none
  const eqCount = await prisma.equipment.count();
  if (eqCount === 0) {
    const equipment = [
      { name: 'Treadmill', category: 'cardio' },
      { name: 'Dumbbells', category: 'strength' },
      { name: 'Yoga Mat', category: 'flexibility' }
    ];
    for (const e of equipment) await prisma.equipment.create({ data: e });
    console.log('Seeded equipment');
  }

  console.log('Seeding complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
