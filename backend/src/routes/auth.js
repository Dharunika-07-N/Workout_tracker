const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { hashPassword, compare } = require('../utils/hash');
const jwtUtil = require('../utils/jwt');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email and password required' });
  try{
    const existing = await prisma.user.findUnique({ where: { email } });
    if(existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    const token = jwtUtil.sign({ id: user.id });
    res.json({ token, user: { id: user.id, email: user.email } });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email and password required' });
  try{
    const user = await prisma.user.findUnique({ where: { email } });
    if(!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwtUtil.sign({ id: user.id });
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    res.json({ token, user: { id: user.id, email: user.email } });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  // simple endpoint - expects auth middleware to set req.user
  if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = req.user;
  res.json({ id: user.id, email: user.email, isVerified: user.isVerified });
});

module.exports = router;
