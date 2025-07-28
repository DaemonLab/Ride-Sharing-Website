import { Details, getUserById } from "../models/userModel.js";

export async function getDetails(req, res) {
  try {
    const result = await Details();

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error in serverCheck: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserProfile(req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const userId = req.session.user.id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error in getUserProfile: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}