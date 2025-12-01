const authService = require('../services/authService');

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