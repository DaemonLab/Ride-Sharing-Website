import {
  addMessage,
  getOlderMessages
} from "../models/chatModel.js";
import { getRideMembers as getRideMembersModel } from "../models/chatModel.js";

// Get ride members
export async function getRideMembers({ rideID }) {
  try {
    const result = await getRideMembersModel({ rideID });
    return result;
  } catch (error) {
    console.error("Error getting ride member names:", error);
    throw new Error("Failed to retrieve ride member names");
  }
}

// Get previous messages
export async function getPreviousMessages({ rideID }) {
  try {
    const messages = await getOlderMessages({ rideID });
    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw new Error("Failed to retrieve messages");
  }
}

// Add a new message
export async function addNewMessage({ rideID, user_id, name, message }) {
  try {
    await addMessage({ rideID, user_id, name, message });
    return { success: true };
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error("Failed to add message");
  }
}