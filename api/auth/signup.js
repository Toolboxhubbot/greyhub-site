const { getUsers, hashPassword, sign, sessionCookie } = require('./_lib');
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
  let username = String((body && body.username) || '').trim();
  const password = String((body && body.password) || '');
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (username.length > 24) return res.status(400).json({ error: 'Username too long' });
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username: letters, numbers, underscore only' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (password.length > 64) return res.status(400).json({ error: 'Password too long' });
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: 'Username already taken' });
  const { salt, hash } = hashPassword(password);
  users.push({ username, salt, hash, created: new Date().toISOString() });
  const token = sign({ username, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  res.setHeader('Set-Cookie', sessionCookie(token));
  return res.status(200).json({ ok: true, user: { username } });
};
