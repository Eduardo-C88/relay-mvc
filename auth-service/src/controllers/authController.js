const authService = require('../services/authService');

/**
 * @api {post} /api/auth/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Auth
 * 
 * @apiParam {String} name User's name.
 * @apiParam {String} email User's email.
 * @apiParam {String} password User's password.
 * 
 * @apiSuccess {Number} id User's unique ID.
 * @apiSuccess {String} email User's email.
 * @apiSuccess {String} message Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 1,
 *       "email": "user@email.com",
 *       "message": "User registered successfully."
 *    }
 * 
 * 
 * @apiError (400) BadRequest Missing or invalid parameters.
 * @apiError (409) Conflict User with the given email already exists.
 * @apiError (500) InternalServerError Server error.
 */
exports.register = async (req, res) => {
    const { name, email,password } = req.body;

    //validar se name e password estao presentes
    if (!name || !password || !email) {
        return  res.status(400).json({ message: 'Name, password and email are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Pass 'name' correctly
        const user = await authService.register({ name, email, password });
        // SUCCESS: Send a concise response
        return res.status(201).json({ 
            id: user.id, 
            email: user.email, 
            message: 'User registered successfully.' 
        });
    } catch (error) {
        // Handle specific errors thrown from the service
        if (error.message === 'User already exists') {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


/** * @api {post} /api/auth/login Login a user
 * @apiName LoginUser
 * @apiGroup Auth
 * * @apiParam {String} email User's email.
 * @apiParam {String} password User's password.
 * @apiSuccess {String} accessToken JWT access token.
 * @apiSuccess {String} refreshToken JWT refresh token.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 * @apiError (400) BadRequest Missing or invalid parameters.    
 * @apiError (401) Unauthorized Invalid email or password.
 * @apiError (500) InternalServerError Server error.
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    //validar se username e password estao presentes
    if (!email || !password) {  
        return  res.status(400).json({ message: 'email and password are required' });
    } 

    try {
        const tokens = await authService.login({ email, password });
        return res.status(200).json(tokens);
    } catch (error) {
        // Handle specific errors thrown from the service
        if (error.message === 'Invalid username or password') {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/** * @api {post} /api/auth/refreshToken Refresh JWT access token
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiParam {String} refreshToken JWT refresh token.
 * @apiSuccess {String} accessToken New JWT access token.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   
 *    }
 * @apiError (400) BadRequest Missing or invalid parameters.
 * @apiError (401) Unauthorized Invalid refresh token.
 * @apiError (500) InternalServerError Server error.
 */
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const newToken = await authService.refreshToken(refreshToken);
        return res.status(200).json(newToken);
    } catch (error) {
        if (error.message === 'Invalid refresh token') {
            return res.status(401).json({ message: error.message });
        }  
        console.error('Refresh token error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/** * @api {delete} /api/auth/logout Logout a user
 * @apiName LogoutUser
 * @apiGroup Auth
 * @apiParam {String} refreshToken JWT refresh token.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 * @apiError (400) BadRequest Missing or invalid parameters.
 * @apiError (500) InternalServerError Server error.
 */
exports.logout = async (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }
    try {
        await authService.logout(refreshToken);
        return res.sendStatus(204);
    } catch (error) {
        // Use the error object in the log for better debugging context
        console.error('Logout failed due to server/DB issue:', error); 
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/** * @api {post} /api/auth/changePassword Change user password
 * @apiName ChangePassword
 * @apiGroup Auth
 * @apiHeader {String} Authorization Bearer token.
 * @apiParam {String} currentPassword User's current password.
 * @apiParam {String} newPassword User's new password.
 * @apiSuccess {String} message Success message.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     { "message": "Password changed successfully." }
 * @apiError (400) BadRequest Missing or invalid parameters.
 * @apiError (401) Unauthorized Invalid or missing token.
 * @apiError (500) InternalServerError Server error.
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }

        await authService.changePassword(userId, currentPassword, newPassword);
        return res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        if (error.message === 'Current password is incorrect') {
            // 400 Bad Request: Invalid input credential
            return res.status(400).json({ message: error.message }); 
        }
        
        // Although rare in this flow, handle if the service couldn't find the user.
        if (error.message === 'User not found') {
            // 404 Not Found (or 401/403 if you prefer, as it implies bad auth state)
            return res.status(404).json({ message: error.message }); 
        }
        
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await authService.deleteAccount(userId);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting account:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}