const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Create or update user profile
router.post('/', async (req, res) => {
  const { height, weight, age, gender } = req.body;
  const userId = req.user.id;
  try{
    const existing = await prisma.userProfile.findUnique({ where: { userId } });
    if(existing){
      const updated = await prisma.userProfile.update({ where: { id: existing.id }, data: { heightCm: height, weightKg: weight, age, gender } });
      return res.json(updated);
    }
    const created = await prisma.userProfile.create({ data: { userId, heightCm: height, weightKg: weight, age, gender } });
    res.json(created);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try{
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.user.id } });
    res.json(profile);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', async (req, res) => {
  const { height, weight, age, gender } = req.body;
  try{
    const profile = await prisma.userProfile.update({ where: { userId: req.user.id }, data: { heightCm: height, weightKg: weight, age, gender } });
    res.json(profile);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/equipment', async (req, res) => {
  const { equipmentIds } = req.body; // array
  if(!Array.isArray(equipmentIds)) return res.status(400).json({ error: 'equipmentIds must be an array' });
  try{
    const ops = equipmentIds.map(id => prisma.userEquipment.create({ data: { userId: req.user.id, equipmentId: id } }));
    const results = await Promise.all(ops);
    res.json(results);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/goals', async (req, res) => {
  const { goalType, targetValue, targetDate } = req.body;
  try{
    const g = await prisma.userGoal.create({ data: { userId: req.user.id, goalType, targetValue, currentValue: 0.0, targetDate: targetDate ? new Date(targetDate) : null, status: 'active' } });
    res.json(g);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
