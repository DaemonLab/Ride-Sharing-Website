import { google } from 'googleapis';
import axios from 'axios';
import { generateToken, isEmailAllowed } from '../utils';
require('dotenv').config();

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
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    prompt: 'consent',      // Force consent screen for refresh token
    scope: SCOPES
  });
  res.redirect(authUrl);
}

export const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);

    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const { sub: googleId, email, name, picture } = userInfo.data;

    if (!isEmailAllowed(email)) {
      return res.status(403).json({ error: 'Email domain not allowed' });
    }

    let user = await UserModel.findByGoogleId(googleId);

    if (user) {
      const updateData = {
        accessToken: tokens.access_token,
        tokenExpiry: new Date(tokens.expiry_date)
      };

      if (tokens.refresh_token) {
        updateData.refreshToken = tokens.refresh_token;
      }

      user = await UserModel.update(user.id, updateData);
    } else {
      user = await UserModel.create({
        googleId,
        email,
        name,
        picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date)
      });
    }

    const token = generateToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.redirect('/');

  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
}

export const getNewToken = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = generateToken(req.user);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({ success: true });
}

export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
}