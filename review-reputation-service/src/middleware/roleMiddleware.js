module.exports.authorizeRole = (allowedRolesId) => {
    return (req, res, next) => {
        const userRoleId = req.user.roleId;

        if (!allowedRolesId.includes(userRoleId)) {
            // Log for security auditing
            console.warn(`Access denied: User ${req.user.id} (Role: ${userRoleId}) attempted access to protected resource.`);
            
            return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
        }
        next();
    };
}