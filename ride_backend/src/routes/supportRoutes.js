import express from "express";
import { sendContactRequest } from "../controllers/supportController.js";
const router = express.Router();

router.post("/contact", sendContactRequest)

export default router;


