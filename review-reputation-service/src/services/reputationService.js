import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get user reputation
 * @param {number} userId
 * @returns {Promise<UserReputation>}
 */
export const getUserReputation = async (userId) => {
    const reputation = await prisma.userReputation.findUnique({
        where: { userId },
    });
    return reputation;
};

/**
 * Update user reputation
 * @param {number} userId
 * @param {'BUYER'|'SELLER'} roleType
 * @param {number} rating
 * @returns {Promise<UserReputation>}
 */
export const updateUserReputation = async (userId, roleType, rating) => {
    // Fetch current reputation
    let rep = await prisma.userReputation.findUnique({ where: { userId } });

    // If doesn't exist, create initial record
    if (!rep) {
        rep = await prisma.userReputation.create({
            data: {
                userId,
                sellerRating: 0.0,
                sellerReviews: 0,
                buyerRating: 0.0,
                buyerReviews: 0,
                lastUpdated: new Date(),
            },
        });
    }

    if (roleType === 'SELLER') {
        const newCount = rep.sellerReviews + 1;
        const newRating = ((rep.sellerRating * rep.sellerReviews) + rating) / newCount;
        rep = await prisma.userReputation.update({
            where: { userId },
            data: {
                sellerRating: newRating,
                sellerReviews: newCount,
                lastUpdated: new Date(),
            },
        });
    } else if (roleType === 'BUYER') {
        const newCount = rep.buyerReviews + 1;
        const newRating = ((rep.buyerRating * rep.buyerReviews) + rating) / newCount;
        rep = await prisma.userReputation.update({
            where: { userId },
            data: {
                buyerRating: newRating,
                buyerReviews: newCount,
                lastUpdated: new Date(),
            },
        });
    } else {
        throw new Error('Invalid roleType, must be BUYER or SELLER');
    }

    return rep;
};