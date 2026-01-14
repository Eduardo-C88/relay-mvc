const { db } = require('../db');

/**
 * Upsert user profile for created or updated users
 * @param {Object} user - User object from user-service
 */
async function createOrUpdateUserProfile(user) {
  await db
    .insertInto('user_profile')
    .values({
      id: user.userId,
      name: user.name,
      reputation: user.reputation,
      university: user.university,
      course: user.course
    })
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        name: user.name,
        reputation: user.reputation,
        university: user.university,
        course: user.course
      })
    )
    .execute();
}

/**
 * Get user profile by ID
 * @param {number} userId
 * @returns user profile object or null
 */
async function getUserProfileById(userId) {
  return await db
    .selectFrom('user_profile')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirst();
}

module.exports = {
  createOrUpdateUserProfile,
  getUserProfileById
};
