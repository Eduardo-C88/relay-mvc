const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate the JWT Access Token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    
    if (token == null) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // If the error is due to expiration, you might want to return a specific code 
            // that tells the client to go request a new token.
            if (err.name === 'TokenExpiredError') {
                 return res.status(401).json({ error: "Access token expired" }); // Use 401 for expired
            }
            return res.status(403).json({ error: "Invalid token" }); // Use 403 for signature mismatch
        }
        
        // Attach the user information (including ID) to the request
        req.user = user
        next()
    })
}
module.exports.authenticateToken = authenticateToken;