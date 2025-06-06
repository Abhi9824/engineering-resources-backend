const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Accept both "Bearer <token>" and just "<token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user info to request (standardize as userId and role)
      req.user = {
        userId: decoded.id || decoded._id, // Support both 'id' and '_id' keys
        role: decoded.role?.toLowerCase(),
      };

      // Role-based access check
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Role not allowed" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authorizeRoles;
