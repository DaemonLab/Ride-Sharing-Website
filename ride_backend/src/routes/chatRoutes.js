import express from "express";
import {
    getPreviousMessages,
    addNewMessage
}
from "../controllers/chatController.js"

const router = express.Router();


router.post("/getPreviousMessages" , getPreviousMessages);
router.post("/addNewMessageToChat" , addNewMessage);

export default router;






