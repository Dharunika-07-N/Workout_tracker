const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { hashPassword, compare } = require('../utils/hash');
const jwtUtil = require('../utils/jwt');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailUtil = require('../utils/email');

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

// Forgot password - sends (logs) a reset link with a short-lived token
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: 'email required' });
  try{
    const user = await prisma.user.findUnique({ where: { email } });
    if(user){
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(token, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
      await prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } });
      const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&uid=${user.id}`;
      // Try to send email; if SMTP not configured this will log the link
      const subject = 'Password reset instructions';
      const text = `Use the following link to reset your password: ${link}`;
      const html = `<p>Use the following link to reset your password (expires in 1 hour):</p><p><a href="${link}">${link}</a></p>`;
      await emailUtil.sendMail(user.email, subject, html, text).catch(err => console.error('Email send error', err));
    }
    // Always return success to avoid user enumeration
    res.json({ message: 'If the account exists an email with reset instructions has been sent.' });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  const { uid: userId, token, newPassword } = req.body;
  if(!userId || !token || !newPassword) return res.status(400).json({ error: 'userId, token and newPassword required' });
  try{
    const pr = await prisma.passwordReset.findFirst({ where: { userId, used: false, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if(!pr) return res.status(400).json({ error: 'Invalid or expired token' });
    const ok = await bcrypt.compare(token, pr.tokenHash);
    if(!ok) return res.status(400).json({ error: 'Invalid token' });
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await prisma.passwordReset.update({ where: { id: pr.id }, data: { used: true } });
    res.json({ message: 'Password reset successful' });
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
