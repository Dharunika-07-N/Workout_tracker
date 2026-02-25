const request = require('supertest');
const app = require('../server');
const bcrypt = require('bcryptjs');

// Mock prisma client module used by routes
jest.mock('../src/prismaClient', () => ({
  user: {
    findUnique: jest.fn()
  },
  passwordReset: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
}));

jest.mock('../src/utils/email', () => ({ sendMail: jest.fn(() => Promise.resolve()) }));

const prisma = require('../src/prismaClient');
const emailUtil = require('../src/utils/email');

describe('auth endpoints', ()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
  });

  test('POST /api/auth/forgot-password for existing user returns success message and creates reset record', async ()=>{
    const user = { id: 'user-1', email: 'test@example.com' };
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.passwordReset.create.mockResolvedValue({ id: 'pr-1' });

    const res = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(prisma.passwordReset.create).toHaveBeenCalled();
    expect(emailUtil.sendMail).toHaveBeenCalledWith(expect.stringContaining(user.email), expect.any(String), expect.any(String), expect.any(String));
  });

  test('POST /api/auth/reset-password with valid token resets password', async ()=>{
    const userId = 'user-2';
    const token = 'secrettoken123';
    const tokenHash = await bcrypt.hash(token, 10);
    // passwordReset record
    const pr = { id: 'pr-2', userId, tokenHash, used: false, expiresAt: new Date(Date.now()+3600000) };
    prisma.passwordReset.findFirst.mockResolvedValue(pr);
    prisma.user.update.mockResolvedValue({ id: userId });
    prisma.passwordReset.update.mockResolvedValue({ id: pr.id, used: true });

    const res = await request(app).post('/api/auth/reset-password').send({ uid: userId, token, newPassword: 'Newpass123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password reset successful');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: userId } , data: expect.any(Object) }));
    expect(prisma.passwordReset.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: pr.id }, data: { used: true } }));
  });
});
