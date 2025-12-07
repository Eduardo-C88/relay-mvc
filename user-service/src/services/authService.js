const { prisma } = require('../models/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { publishUserCreated } = require("../events/userPublisher");

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

    // Publish UserCreated event
    publishUserCreated({
        userId: newUser.id,
        name: newUser.name,
        reputation: newUser.reputation,
        university: newUser.university?.name,
        course: newUser.course?.name,
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
    const payload = { id: user.id, email: user.email, roleId: user.roleId };

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
    

exports.refreshToken = async (oldRefreshToken) => {

    // Verify the refresh token
    let payload;
    try {
        payload = jwt.verify(oldRefreshToken, process.env.REFRESH_JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
        // If the user was deleted but the token wasn't, revoke the token
        await prisma.refreshToken.delete({ where: { token: oldRefreshToken } });
        throw new Error('Invalid refresh token');
    }

    // Check if the refresh token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({ where: { token: oldRefreshToken } });
    if (!storedToken) {
        throw new Error('Invalid refresh token'); 
    }
    // Generate new tokens
    const newPayload = { id: user.id, email: user.email, roleId: user.roleId };
    const newAccessToken = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign(newPayload, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });
    // Store new refresh token and delete old one in a transaction
    await prisma.$transaction([
        prisma.refreshToken.delete({ where: { token: oldRefreshToken } }),
        prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: payload.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
        })
    ]);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

exports.logout = async (refreshToken) => {
    try {
        // Use delete and specify the unique token field for deletion
        await prisma.refreshToken.delete({ 
            where: { token: refreshToken } 
        });
    } catch (error) {
        // If the token wasn't found (P2025 error code), we can ignore it 
        // because the goal (token revoked) is already achieved, or log it.
        if (error.code === 'P2025') {
            // Optional: Log that a non-existent token was requested for logout
            console.warn('Logout requested for non-existent or already-revoked token.');
            return; 
        }
        // Re-throw any actual database errors
        throw error;
    }
    return;
}

exports.changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
    });
    // Revoke all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
        where: { userId: userId }
    });
    return;
}

exports.deleteAccount = async (userId) => {
    // Delete user and cascade delete refresh tokens
    await prisma.refreshToken.deleteMany({
        where: { userId: userId }
    });
    await prisma.user.delete({
        where: { id: userId }
    });
    return;
}