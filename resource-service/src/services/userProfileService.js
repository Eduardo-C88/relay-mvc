const { db } = require('../db/db');

/**
 * Upsert user profile for created or updated users
 * @param {Object} user - User object from user-service
 */
async function createUserProfile(user) {
  await db
    .insertInto('user_profile')
    .values({
      id: user.userId,
      name: user.name,
      reputation: user.reputation,
    })
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        name: user.name,
        reputation: user.reputation,
      })
    )
    .execute();
}

async function updateUserProfile(user) {
  await db
    .updateTable('user_profile')
    .set({
      name: user.name,
      reputation: user.reputation,
      university: user.university,
      course: user.course,
    })
    .where('id', '=', user.userId)
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
  createUserProfile,
  updateUserProfile,
  getUserProfileById
};
