const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Return all equipment (seed if empty)
router.get('/', async (req, res) => {
  try{
    let list = await prisma.equipment.findMany();
    if(list.length === 0){
      const defaults = [
        { name: 'Treadmill', category: 'cardio' },
        { name: 'Dumbbells', category: 'strength' },
        { name: 'Exercise Bike', category: 'cardio' },
        { name: 'Yoga Mat', category: 'flexibility' }
      ];
      list = await Promise.all(defaults.map(d => prisma.equipment.create({ data: d })));
    }
    res.json(list);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
