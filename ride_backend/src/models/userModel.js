import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

/**
 * Get a user by their internal DB id.
 */
export async function getUserById(id) {
  try {
    return await prisma.users.findUnique({ where: { id } });
  } catch (error) {
    logger.error(`Database error in getUserById: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Find a user by their Google OAuth ID.
 */
export async function findByGoogleId(googleId) {
  try {
    return await prisma.users.findUnique({ where: { google_id: googleId } });
  } catch (error) {
    logger.error(`Database error in findByGoogleId: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Create a new user record after Google OAuth sign-in.
 */
export async function create(userData) {
  try {
    return await prisma.users.create({
      data: {
        google_id: userData.googleId,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      },
    });
  } catch (error) {
    logger.error(`Database error in create: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Update a user's mutable fields (name, picture).
 */
export async function update(id, userData) {
  try {
    const data = {};
    if (userData.name) data.name = userData.name;
    if (userData.picture) data.picture = userData.picture;

    if (Object.keys(data).length === 0) return null;

    return await prisma.users.update({ where: { id }, data });
  } catch (error) {
    logger.error(`Database error in update: ${error.message}`);
    throw new Error(error.message);
  }
}
