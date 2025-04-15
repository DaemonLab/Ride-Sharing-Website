import express from "express";
import { getDetails } from "../controllers/userController.js";

const router = express.Router();

router.get("/serverCheck" , getDetails)

export default router;


