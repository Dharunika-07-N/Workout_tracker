const request = require('supertest');
const app = require('../server');

describe('health', ()=>{
  test('GET /api/health returns ok', async ()=>{
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status','ok');
  });
});
