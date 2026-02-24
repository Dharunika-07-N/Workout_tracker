const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic recommendations placeholder
app.get('/api/recommendations/daily', (req, res) => {
  // In later modules this will call RecommendationService
  const sample = {
    user_id: req.query.user_id || 'demo',
    date: req.query.date || new Date().toISOString().slice(0,10),
    exercises: [
      { id: 'ex-1', name: 'Bodyweight Squats', sets: 3, reps: 12 },
      { id: 'ex-2', name: 'Push-ups', sets: 3, reps: 10 },
      { id: 'ex-3', name: 'Plank', duration_minutes: 2 }
    ]
  };
  res.json(sample);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
