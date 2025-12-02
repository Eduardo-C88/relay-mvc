const { prisma } = require('../models/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async ({ name, email, password }) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw { status: 400, message: 'User with this email already exists' };
    }

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            name,   
            email,
            password: hashedPassword,
        }
    });
    
    // Do not return the password hash!
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

exports.login = async ({ email, password }) => {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('There is no user with this email');
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    // Generate JWT token
    const payload = { id: user.id, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in DB
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Calculate 7 days from now
        }
    });

    return { accessToken: token, refreshToken: refreshToken }
};
    
