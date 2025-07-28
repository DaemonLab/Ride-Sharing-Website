import { getUserById, update } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { oauth2Client } from "../controllers/loginController.js";
import { config } from "dotenv";

config();

export const authenticate = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin === true) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
}