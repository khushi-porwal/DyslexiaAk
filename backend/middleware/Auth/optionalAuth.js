const jwt = require("jsonwebtoken");

/**
 * Soft auth: attaches req.userId when a valid Bearer token is present.
 * Does not block the request when missing/invalid - useful for endpoints
 * that should work both authenticated and anonymous.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
  } catch (err) {
    // ignore invalid/expired tokens and continue
  }

  return next();
};

module.exports = optionalAuth;
