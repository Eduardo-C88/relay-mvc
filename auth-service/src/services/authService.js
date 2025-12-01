const { prisma } = require('../models/prismaClient');
const bcrypt = require('bcryptjs');

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
    
