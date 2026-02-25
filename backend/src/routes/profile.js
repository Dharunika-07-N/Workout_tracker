const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/profile — get profile + goals + equipment
router.get('/', async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.user.id } });
    const goals = await prisma.userGoal.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    const userEquipment = await prisma.userEquipment.findMany({
      where: { userId: req.user.id },
      include: { equipment: true },
    });
    res.json({
      profile: profile || null,
      goals,
      equipment: userEquipment.map(ue => ({ id: ue.equipmentId, name: ue.equipment.name, category: ue.equipment.category })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/profile — create or update profile
router.post('/', async (req, res) => {
  const { height, weight, age, gender, targetWeight } = req.body;
  const userId = req.user.id;
  try {
    const existing = await prisma.userProfile.findUnique({ where: { userId } });
    if (existing) {
      const updated = await prisma.userProfile.update({
        where: { id: existing.id },
        data: { heightCm: height, weightKg: weight, age, gender, targetWeightKg: targetWeight },
      });
      return res.json(updated);
    }
    const created = await prisma.userProfile.create({
      data: { userId, heightCm: height, weightKg: weight, age, gender, targetWeightKg: targetWeight },
    });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/profile — update profile fields
router.put('/', async (req, res) => {
  const { height, weight, age, gender, targetWeight } = req.body;
  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: { heightCm: height, weightKg: weight, age, gender, targetWeightKg: targetWeight },
      create: { userId: req.user.id, heightCm: height, weightKg: weight, age, gender, targetWeightKg: targetWeight },
    });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/profile/equipment — set user equipment (replaces existing)
router.post('/equipment', async (req, res) => {
  const { equipmentIds } = req.body; // array of equipment IDs
  if (!Array.isArray(equipmentIds)) return res.status(400).json({ error: 'equipmentIds must be an array' });
  try {
    // Delete old and create new (replace strategy)
    await prisma.userEquipment.deleteMany({ where: { userId: req.user.id } });
    const ops = equipmentIds.map(id => prisma.userEquipment.create({ data: { userId: req.user.id, equipmentId: id } }));
    await Promise.all(ops);
    res.json({ saved: equipmentIds.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/profile/goals — create a goal
router.post('/goals', async (req, res) => {
  const { goalType, targetValue, targetDate } = req.body;
  try {
    const g = await prisma.userGoal.create({
      data: {
        userId: req.user.id,
        goalType,
        targetValue,
        currentValue: 0.0,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: 'active',
      },
    });
    res.json(g);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/profile/goals — list all goals
router.get('/goals', async (req, res) => {
  try {
    const goals = await prisma.userGoal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
