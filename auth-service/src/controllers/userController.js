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
        const user = await authService.register({ name: username, email, password });
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