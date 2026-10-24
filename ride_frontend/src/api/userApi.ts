import axiosInstance from "./axiosInstance";

interface UserProfileResponse {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
}

/**
 * API Layer — User
 * Raw HTTP calls to /user/* endpoints.
 */

/** Fetch the currently authenticated user's profile */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axiosInstance.get<{ success: boolean; data: UserProfileResponse }>("/user/profile");
  return response.data.data;
};
