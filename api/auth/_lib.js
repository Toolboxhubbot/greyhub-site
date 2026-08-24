const crypto = require('crypto');
const AUTH_SECRET = process.env.AUTH_SECRET || 'appleware-dev-secret-change-me';
function getUsers() { if (!globalThis.__appleware_users) globalThis.__appleware_users = []; return globalThis.__appleware_users; }
function hashPassword(password, salt) { salt = salt || crypto.randomBytes(16).toString('hex'); const hash = crypto.scryptSync(password, salt, 32).toString('hex'); return { salt, hash }; }
function verifyPassword(password, salt, hash) { const h = crypto.scryptSync(password, salt, 32).toString('hex'); return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hash, 'hex')); }
function b64url(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function sign(payload) { const data = b64url(JSON.stringify(payload)); const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); return data + '.' + sig; }
function verify(token) { if (!token || !token.includes('.')) return null; const [data, sig] = token.split('.'); const expected = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); if (sig !== expected) return null; try { const json = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(); const payload = JSON.parse(json); if (payload.exp && Date.now() > payload.exp) return null; return payload; } catch { return null; } }
function parseCookie(req) { const raw = req.headers.cookie || ''; const m = raw.match(/(?:^|;\s*)aw_session=([^;]+)/); return m ? decodeURIComponent(m[1]) : null; }
function sessionCookie(token) { return 'aw_session=' + token + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000'; }
function clearCookie() { return 'aw_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'; }
module.exports = { getUsers, hashPassword, verifyPassword, sign, verify, parseCookie, sessionCookie, clearCookie };
