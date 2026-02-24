const jwtUtil = require('../utils/jwt');
const prisma = require('../prismaClient');

async function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwtUtil.verify(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if(!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
}

module.exports = authMiddleware;
