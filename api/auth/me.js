const { verify, parseCookie } = require('./_lib');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const user = verify(parseCookie(req));
  if (!user) return res.status(200).json({ user: null });
  return res.status(200).json({ user: { username: user.username } });
};
