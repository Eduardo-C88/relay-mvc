const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to authenticate JWT tokens
module.exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // 401: Token is missing.
        return res.status(401).json({ message: "Access token required." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Check for specific JWT errors
            if (err.name === 'TokenExpiredError') {
                // 401: Token is expired. Tell the client to refresh it.
                return res.status(401).json({ message: "Access token expired." });
            } 
            
            // 403: Invalid signature or other non-recoverable error (e.g., malformed token).
            return res.status(403).json({ message: "Invalid token." });
        }

        req.user = user;
        next();
    });
};
