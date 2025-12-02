const userService = require('../services/userService');

exports.getUserProfile = async (req, res) => {
    try {
        // Get the ID from the payload attached by the middleware (req.user)
        const userId = req.user.id; 
        const userProfile = await userService.getUserProfile(userId); 
        
        // Since the ID comes from a valid token, userProfile should generally exist.
        // If it doesn't, it means the user was deleted after the token was issued.
        if (!userProfile) { 
            return res.status(404).json({ message: 'Authenticated user not found' });
        }
        
        return res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};