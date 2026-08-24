const { clearCookie } = require('./_lib');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', clearCookie());
  return res.status(200).json({ ok: true });
};
