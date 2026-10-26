import { prisma } from "../config/prisma.js";

// Get a user by their ID
export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// Find a user by their email
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// Update a user's profile
export async function update(id: string, userData: { name?: string; image?: string | null }) {
  const data: { name?: string; image?: string | null } = {};
  if (userData.name !== undefined && userData.name !== null) data.name = userData.name;
  if (userData.image !== undefined) data.image = userData.image;

  if (Object.keys(data).length === 0) return null;

  return prisma.user.update({ where: { id }, data });
}
