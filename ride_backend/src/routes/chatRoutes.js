import express from "express";
import {
    getPreviousMessages,
    addNewMessage,
    getRideMembers
}
from "../controllers/chatController.js"

const router = express.Router();


router.post("/rideMembers" , getRideMembers)

// ye dono functions socket vale code me use hoge
router.post("/getPreviousMessages" , getPreviousMessages);
router.post("/addNewMessageToChat" , addNewMessage);

export default router;





