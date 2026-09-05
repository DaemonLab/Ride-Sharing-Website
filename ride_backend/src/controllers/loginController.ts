import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";
import { isEmailAllowed } from "../utils/index.js";
import { findByGoogleId, create, update } from "../services/userService.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

// Create the OAuth2 client using credentials from env
const oauthClient = new OAuth2Client(env.googleClientId, env.googleClientSecret, env.redirectUrl);

// GET /auth/google — redirect user to Google OAuth consent screen
export const loginRedirect = (req: Request, res: Response) => {
  if (req.session.user) {
    res.redirect(`${env.frontendUrl}/profile?status=already_authenticated`);
    return;
  }

  const authUrl = oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: SCOPES,
  });
  res.redirect(authUrl);
};

// GET /auth/google/callback — Google redirects here with the auth code after user consents
export const googleCallback = async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query as Record<string, string | undefined>;

  logger.info(`OAuth callback — code length: ${code?.length ?? "none"}, session: ${req.sessionID}`);

  if (error) {
    logger.warn(`OAuth error: ${error} — ${error_description}`);
    res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent("Authentication cancelled or failed")}`);
    return;
  }

  if (!code) {
    res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent("Authorization code not provided")}`);
    return;
  }

  try {
    oauthClient.setCredentials({});
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent("Invalid token payload")}`);
      return;
    }

    if (!isEmailAllowed(payload.email)) {
      logger.error(`Email domain not allowed: ${payload.email}`);
      res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent("Email domain not allowed")}`);
      return;
    }

    // Find existing user or create a new one
    let user = await findByGoogleId(payload.sub);
    if (user) {
      const updated = await update(user.id, { name: payload.name, picture: payload.picture });
      if (updated) user = updated;
    } else {
      user = await create({ googleId: payload.sub, email: payload.email, name: payload.name, picture: payload.picture });
    }

    // Store user identity in the session — this is what req.session.user gives you on every route
    req.session.user = {
      id:       user.id,
      googleId: user.google_id,
      email:    user.email,
      name:     user.name ?? null,
      picture:  user.picture ?? null,
      isAdmin:  user.isadmin ?? null,
    };

    req.session.refreshToken = tokens.refresh_token ?? undefined;
    res.redirect(`${env.frontendUrl}/profile?status=success`);
  } catch (err) {
    const error = err as Error;
    logger.error(`OAuth callback error: ${error.message}`);
    res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent(error.message)}`);
  }
};

// GET /auth/status — returns current session status (used by frontend to check if logged in)
export const getStatus = (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({ isAuthenticated: false, user: null });
    return;
  }
  res.status(200).json({ isAuthenticated: true, user: req.session.user });
};

// POST /auth/logout — destroy the session and clear the cookie
export const logout = (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(400).json({ success: false, error: "No user session found" });
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      logger.error("Logout error:", err);
      res.status(500).json({ success: false, error: "Logout failed" });
      return;
    }
    res.clearCookie("rideshare.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

