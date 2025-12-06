const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' });
}

function verifyUser(req) {
  const token = req.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const verified = verifyUser(req);
  if (!verified) {
    return res.status(401).json({ success: false, errorMessage: 'Not logged in' });
  }
  req.userId = verified.id;
  req.userEmail = verified.email;
  next();
}

module.exports = { signToken, verifyUser, requireAuth };
