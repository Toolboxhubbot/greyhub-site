const { getUsers, verifyPassword, sign, sessionCookie } = require('./_lib');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const username = String((body && body.username) || '').trim();
  const password = String((body && body.password) || '');
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !verifyPassword(password, user.salt, user.hash)) return res.status(401).json({ error: 'Invalid username or password' });
  const token = sign({ username: user.username, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  res.setHeader('Set-Cookie', sessionCookie(token));
  return res.status(200).json({ ok: true, user: { username: user.username } });
};
