const express = require('express');
const router = express.Router();
const recService = require('../services/recommendationService');

router.get('/daily', async (req, res) => {
  const userId = req.query.user_id || req.user?.id || 'demo';
  const date = req.query.date || new Date().toISOString().slice(0,10);
  try{
    const rec = await recService.generateDailyRecommendation(userId, date);
    res.json(rec);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
