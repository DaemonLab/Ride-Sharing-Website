import { UserModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import oauth2Client from "../controllers/loginController.js";
require('dotenv').config();

export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      req.user = null;
      return next();
    }

    const isTokenExpired = user.token_expiry && new Date(user.token_expiry) <= new Date(Date.now() + 5 * 60 * 1000);

    if (isTokenExpired && user.refresh_token) {
      try {
        oauth2Client.setCredentials({
          refresh_token: user.refresh_token
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        const updateData = {
          accessToken: credentials.access_token,
          tokenExpiry: new Date(credentials.expiry_date)
        };

        if (credentials.refresh_token) {
          updateData.refreshToken = credentials.refresh_token;
        }

        await UserModel.update(user.id, updateData);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    req.user = null;
    next();
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.admin === true) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
}