import {
    addMessage,
    getOlderMessages
} from "../models/chatModel.js";

 
export async function getPreviousMessages(req, res) {
    try {
        const messages = await getOlderMessages(req.body);
        return res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve messages",
            error: error.message
        });
    }
}

 
export async function addNewMessage(req, res) {
    try {
        await addMessage(req.body);
        return res.status(201).json({
            success: true,
            message: "Message added successfully"
        });
    } catch (error) {
        console.error("Error adding message:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add message",
            error: error.message
        });
    }
}
