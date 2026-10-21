import { getUserProfile } from "../api/userApi";
import { UserProfile } from "../types";

/**
 * Service Layer — User
 * Maps raw backend user data to the frontend UserProfile type.
 */

/**
 * Fetches and maps the authenticated user's profile.
 * The backend returns { id, name, email, picture } — we map to our UserProfile type.
 * Throws on failure so the hook can set an error state.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const data = await getUserProfile();
  return {
    studentId: String(data.id),
    name: data.name ?? "Student",
    email: data.email,
    photoUrl: data.picture ?? undefined,
  };
};
