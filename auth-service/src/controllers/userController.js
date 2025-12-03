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

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // 1. FILTER/WHITELIST: Only allow permitted fields
        const { address, courseId, universityId } = req.body;

        // 2. BUILD UPDATE OBJECT: Only include fields that were actually provided
        const updateData = {};
        if (address !== undefined) updateData.address = address;
        if (courseId !== undefined) updateData.courseId = courseId;
        if (universityId !== undefined) updateData.universityId = universityId;
        
        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const updatedUser = await userService.updateUserProfile(userId, updateData);
        return res.status(200).json(updatedUser);
    } catch (error) {
        // Handle the Foreign Key violation (P2003)
        if (error.code === 'P2003') {
            const constraint = error.meta.constraint;
            let message = 'Invalid data provided.';

            if (constraint.includes('courseId')) {
                message = 'The provided Course ID does not exist.';
            } else if (constraint.includes('universityId')) {
                message = 'The provided University ID does not exist.';
            }

            return res.status(400).json({ 
                message: message, 
                code: 'INVALID_FOREIGN_KEY' 
            });
        }
        
        // Handle other errors (like P2002 Unique Constraint, or generic 500s)
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};