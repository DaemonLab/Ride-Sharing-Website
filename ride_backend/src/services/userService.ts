import { prisma } from "../config/prisma.js";

// Get a user by their internal DB id
export async function getUserById(id: number) {
  return prisma.users.findUnique({ where: { id } });
}

// Find a user by their Google OAuth ID
export async function findByGoogleId(googleId: string) {
  return prisma.users.findUnique({ where: { google_id: googleId } });
}

// Create a new user record after first Google OAuth sign-in
export async function create(userData: {
  googleId: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}) {
  return prisma.users.create({
    data: {
      google_id: userData.googleId,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    },
  });
}

// Update a user's name and/or profile picture after re-login
export async function update(id: number, userData: { name?: string | null; picture?: string | null }) {
  const data: { name?: string | null; picture?: string | null } = {};
  if (userData.name !== undefined) data.name = userData.name;
  if (userData.picture !== undefined) data.picture = userData.picture;

  if (Object.keys(data).length === 0) return null; // nothing to update

  return prisma.users.update({ where: { id }, data });
}

// Sync user from Better Auth session into the app's `users` table
export async function syncUserWithApp(authUser: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  let appUser = await prisma.users.findFirst({
    where: { email: authUser.email },
  });

  if (appUser) {
    if (
      (authUser.name && authUser.name !== appUser.name) ||
      (authUser.image && authUser.image !== appUser.picture)
    ) {
      appUser = await prisma.users.update({
        where: { id: appUser.id },
        data: {
          name: authUser.name ?? appUser.name,
          picture: authUser.image ?? appUser.picture,
        },
      });
    }
    return appUser;
  }

  return prisma.users.create({
    data: {
      google_id: authUser.id,
      email: authUser.email,
      name: authUser.name ?? authUser.email,
      picture: authUser.image ?? null,
      isadmin: false,
    },
  });
}

