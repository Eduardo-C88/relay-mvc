const { db } = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { publishUserCreated } = require("../events/userPublisher");

exports.register = async ({ name, email, password }) => {
    // Check if user already exists
    const existingUser = await db
        .selectFrom('users')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst();

    if (existingUser) {
        throw { status: 400, message: 'User with this email already exists' };
    }

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await db
        .insertInto('users')
        .values({
            name,
            email,
            password: hashedPassword,
        })
        .returningAll()
        .executeTakeFirst();

    // Publish UserCreated event
    publishUserCreated({
        userId: newUser.id,
        name: newUser.name,
        reputation: newUser.reputation,
    });
    
    // Do not return the password hash!
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

exports.login = async ({ email, password }) => {
    // Find user by email
    const user = await db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst();

    if (!user) {
        throw new Error('There is no user with this email');
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    // Generate JWT token
    const payload = { id: user.id, email: user.email, roleId: user.role_id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in DB
    await db
        .insertInto('refresh_token')
        .values({
            token: refreshToken,
            user_id: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        .execute();

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

    const user = await db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', payload.id)
        .executeTakeFirst();

    if (!user) {
        // If the user was deleted but the token wasn't, revoke the token
        await db
            .deleteFrom('refresh_token')
            .where('token', '=', oldRefreshToken)
            .execute();
            
        throw new Error('Invalid refresh token');
    }

    // Check if the refresh token exists in DB
    const storedToken = await db
        .selectFrom('refresh_token')
        .selectAll()
        .where('token', '=', oldRefreshToken)
        .executeTakeFirst();

    if (!storedToken) {
        throw new Error('Invalid refresh token'); 
    }
    // Generate new tokens
    const newPayload = { id: user.id, email: user.email, roleId: user.role_id };
    const newAccessToken = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign(newPayload, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });
    // Store new refresh token and delete old one in a transaction
    await db.transaction().execute(async (trx) => {
        await trx.deleteFrom('refresh_token').where('token', '=', oldRefreshToken).execute();
        await trx.insertInto('refresh_token').values({
            token: newRefreshToken,
            user_id: payload.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).execute();
    });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

exports.logout = async (refreshToken) => {
    await db
        .deleteFrom('refresh_token')
        .where('token', '=', refreshToken)
        .execute();
    return;
}

exports.changePassword = async (userId, currentPassword, newPassword) => {
    const user = await db
        .selectFrom('users')
        .select(['id', 'password'])
        .where('id', '=', userId)
        .executeTakeFirst();
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.transaction().execute(async (trx) => {
        // Update password
        await trx
            .updateTable('users')
            .set({ password: hashedNewPassword })
            .where('id', '=', userId)
            .execute();

        // Revoke all tokens for this user
        await trx
            .deleteFrom('refresh_token')
            .where('user_id', '=', userId)
            .execute();
    });
};


exports.deleteAccount = async (userId) => {
    await db
        .deleteFrom('users')
        .where('id', '=', userId)
        .execute();
}