import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create Review
export const createReview = async (reviewData) => {
    if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    return await prisma.review.create({ data: reviewData });
};

// Get Review by ID
export const getReviewById = async (reviewId) => {
    return await prisma.review.findUnique({ where: { id: Number(reviewId) } });
};

// Get All Reviews
export const getAllReviews = async () => {
    return await prisma.review.findMany();
};

// Update Review by ID
export const updateReview = async (reviewId, updateData) => {
    const updated = await prisma.review.update({
        where: { id: Number(reviewId) },
        data: updateData,
    }).catch(() => null);

    if (!updated) {
        const error = new Error('Review not found');
        error.statusCode = 404;
        throw error;
    }

    return updated;
};

// Delete Review by ID
export const deleteReview = async (reviewId) => {
    const deleted = await prisma.review.delete({
        where: { id: Number(reviewId) },
    }).catch(() => null);

    if (!deleted) {
        const error = new Error('Review not found');
        error.statusCode = 404;
        throw error;
    }

    return deleted;
};

// Get Reviews by Reviewed User
export const getReviewsByUser = async (userId) => {
    return await prisma.review.findMany({
        where: { reviewedUserId: Number(userId) }
    });
};

// Get Reviews by Resource
export const getReviewsByResource = async (resourceId) => {
    return await prisma.review.findMany({
        where: { resourceId: Number(resourceId) }
    });
};