const cron = require('node-cron');
const prisma = require('../prismaClient');

function startScheduler() {
  // run every day at 08:00 server time to create reminders for users who haven't worked out
  cron.schedule('0 8 * * *', async () => {
    console.log('Notification scheduler running...');
    try {
      const users = await prisma.user.findMany();
      for (const u of users) {
        // check if user has a workout today
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const session = await prisma.workoutSession.findFirst({ where: { userId: u.id, date: { gte: start, lt: end } } });
        if (!session) {
          await prisma.notification.create({ data: { userId: u.id, type: 'reminder', title: 'Workout reminder', message: 'You have not logged a workout today. Get moving!', metadata: '{}' } });
        }
      }
    } catch (err) {
      console.error('Scheduler error', err);
    }
  });
}

module.exports = { startScheduler };
