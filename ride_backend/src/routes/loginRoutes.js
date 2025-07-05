import express from "express";
import { loginRedirect, googleCallback, getNewToken, logout } from "../controllers/loginController.js";

const router = express.Router()

router.get("/auth/google", loginRedirect)
router.get("/auth/google/callback", googleCallback)
router.post("/api/renew-token", getNewToken)
router.get("/logout", logout)

export default router