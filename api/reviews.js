const { verify, parseCookie } = require('./auth/_lib');

const ADMIN_USER = 'word';

function isAdmin(session) {
  return !!(session && String(session.username || '').toLowerCase() === ADMIN_USER);
}

function reviewsStore() {
  if (!Array.isArray(globalThis.__appleware_reviews)) globalThis.__appleware_reviews = [];
  return globalThis.__appleware_reviews;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  let reviews = reviewsStore();
  const session = verify(parseCookie(req));

  if (req.method === 'GET') return res.status(200).json({ reviews });

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    if (body && body.wipe === true) {
      if (!isAdmin(session)) return res.status(403).json({ error: 'Only admin can wipe' });
      globalThis.__appleware_reviews = [];
      if (body.wipeUsers) globalThis.__appleware_users = [];
      return res.status(200).json({ ok: true, reviews: [], wiped: true, usersWiped: !!body.wipeUsers });
    }

    if (!session) return res.status(401).json({ error: 'Please log in first' });
    const score = Number(body && body.score);
    if (!score || score < 1 || score > 10) return res.status(400).json({ error: 'score 1-10 required' });
    const review = {
      id: String(body.id || ('r_' + Date.now())),
      score: Math.round(score),
      username: session.username,
      text: String((body.text || '')).slice(0, 400),
      date: body.date || new Date().toISOString()
    };
    reviews = reviews.filter(r => r.username !== session.username);
    reviews.push(review);
    if (reviews.length > 200) reviews = reviews.slice(-200);
    globalThis.__appleware_reviews = reviews;
    return res.status(200).json({ reviews, ok: true });
  }

  if (req.method === 'DELETE') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    if (body && body.wipe === true) {
      if (!isAdmin(session)) return res.status(403).json({ error: 'Only admin can wipe' });
      globalThis.__appleware_reviews = [];
      if (body.wipeUsers) globalThis.__appleware_users = [];
      return res.status(200).json({ ok: true, reviews: [], wiped: true });
    }

    const id = (req.query && req.query.id) || (body && body.id) || '';
    if (!id) return res.status(400).json({ error: 'id required' });
    if (!session) return res.status(401).json({ error: 'Please log in first' });

    if (isAdmin(session)) {
      reviews = reviews.filter(r => r.id !== id);
    } else {
      reviews = reviews.filter(r => !(r.id === id && r.username === session.username));
    }
    globalThis.__appleware_reviews = reviews;
    return res.status(200).json({ reviews, ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
};
