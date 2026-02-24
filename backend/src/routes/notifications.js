const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/notifications
router.get('/', async (req, res) => {
  try{
    const notes = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json(notes);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/read', async (req, res) => {
  try{
    const id = req.params.id;
    const note = await prisma.notification.updateMany({ where: { id, userId: req.user.id }, data: { isRead: true } });
    res.json({ updated: note.count });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
