import { prisma } from "../config/prisma.js";

// Get a user by their ID
export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
