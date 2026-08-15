import { google } from 'googleapis';
import { isEmailAllowed } from '../utils.js';
import { findByGoogleId, create, update } from '../models/userModel.js';
import { config } from 'dotenv';
import { logger } from '../config/logger.js';

config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Validate environment variables
function validateEnvVars() {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'REDIRECT_URL'];
  const missing = required.filter(env => !process.env[env]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  logger.info('Google OAuth Environment Variables:');
  logger.info(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing'}`);
  logger.info(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'}`);
  logger.info(`REDIRECT_URL: ${process.env.REDIRECT_URL}`);
}

// Validate on startup
validateEnvVars();

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export const loginRedirect = (req, res) => {
  // If already logged in, send them back to the frontend profile page
  // instead of dumping raw JSON in the browser.
  if (req.session.user) {
    return res.redirect(`${FRONTEND_URL}/profile?status=already_authenticated`);
  }
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: SCOPES,
  });
  res.redirect(authUrl);
}

export const googleCallback = async (req, res) => {
  const { code, error, error_description } = req.query;

  logger.info('OAuth callback received:');
  logger.info(`Code length: ${code ? code.length : 'No code'}`);
  logger.info(`Error: ${error}`);
  logger.info(`Session ID: ${req.sessionID}`);

  // Handle OAuth errors (like when user hits back button)
  if (error) {
    logger.warn(`OAuth error: ${error} - ${error_description}`);
    return res.redirect(`${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent('Authentication cancelled or failed')}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent('Authorization code not provided')}`);
  }

  try {
    // Clear any existing credentials to avoid conflicts
    oauth2Client.setCredentials({});

    logger.info('Attempting to exchange code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    logger.info('Tokens received successfully');

    // Set the credentials for this request
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!isEmailAllowed(payload.email)) {
      logger.error(`Email domain not allowed: ${payload.email}`);
      // Redirect to frontend with error message
      return res.redirect(`${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent('Email domain not allowed')}`);
    }

    let user = await findByGoogleId(payload.sub);

    if (user) {
      const updateData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      user = await update(user.id, updateData);

    } else {
      user = await create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    }

    req.session.user = {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: user.isadmin
    };

    req.session.refreshToken = tokens.refresh_token;
    res.redirect(`${FRONTEND_URL}/profile?status=success`);

  } catch (error) {
    logger.error(`Error during authentication: ${error}`);

    // More specific error handling
    if (error.message.includes('invalid_grant')) {
      logger.error(`Invalid grant error - possible causes:`);
      logger.error(`1. Authorization code already used`);
      logger.error(`2. Authorization code expired (10 minutes limit)`);
      logger.error(`3. Clock skew between client and server`);
      logger.error(`4. Incorrect redirect URI`);
    }
    res.redirect(`${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent(error.message)}`);
  }
}

export const getStatus = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ isAuthenticated: false, user: null });
  }

  return res.status(200).json({
    isAuthenticated: true,
    user: req.session.user
  });
}

export const logout = (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ error: 'No user session found' });
  }
  req.session.destroy(err => {
    if (err) {
      logger.error('Error during logout:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
}