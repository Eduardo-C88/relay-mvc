const userService = require('../services/userService');

/** * @api {get} /api/users/me Get authenticated user's profile
 * @apiName GetUserProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token.
 * @apiSuccess {Object} user User profile data.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "John Doe",
 *      "email": "test@email.com",
 *      "reputation": 100,
 *      "address": "123 Main St",
 *      "course": { "id": 2, "name": "Computer Science" },
 *      "university": { "id": 1, "name": "Tech University" },
 *      "role": { "id": 1, "name": "User" },
 *      "createdAt": "2024-01-01T00:00:00.000Z"
 *     }
 * @apiError (401) Unauthorized Invalid or missing token.
 * @apiError (500) InternalServerError Server error.
 */
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

/** * @api {put} /api/users/me Update authenticated user's profile
 * @apiName UpdateUserProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearer token.
 * @apiParam {String} [address] User's address.
 * @apiParam {Number} [courseId] ID of the user's course.
 * @apiParam {Number} [universityId] ID of the user's university.
 * @apiSuccess {Object} user Updated user profile data.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     "address": "456 New St",
 *    "course": { "id": 3, "name": "Mathematics" },
 *    "university": { "id": 2, "name": "Science University" },
 *    "reputation": 100
 *    }
 * @apiError (400) BadRequest Invalid input data.
 * @apiError (401) Unauthorized Invalid or missing token.
 * @apiError (500) InternalServerError Server error.
 */
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

exports.changeUserRole = async (req, res) => {
    try {
        const userId = parseInt(req.params.id); // Target user ID
        const { roleId } = req.body;            // New role ID from the body
        
        // Input validation: Ensure roleId is provided and is a number
        if (!roleId || typeof roleId !== 'number' || roleId <= 0) {
            return res.status(400).json({ message: 'A valid roleId must be provided in the request body.' });
        }
        
        const updatedUser = await userService.changeUserRole(userId, roleId);
        
        // Handle case where target user ID does not exist
        if (!updatedUser) {
             return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }
        
        return res.status(200).json(updatedUser);
    } catch (error) {
        // Handle custom service errors
        if (error.message === 'Role ID does not exist.') {
            return res.status(400).json({ message: error.message });
        }
        
        // Handle Prisma errors (e.g., if the user ID doesn't exist)
        if (error.code === 'P2025') {
             // P2025 is a "not found" error, specifically for the where clause
            return res.status(404).json({ message: `User with ID ${req.params.id} not found.` });
        }

        console.error('Error changing user role:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};