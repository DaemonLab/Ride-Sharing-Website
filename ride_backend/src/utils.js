import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

export const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};

export const isEmailAllowed = (email) => {
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',');
    const emailDomain = email?.split('@')[1].lowerCase();

    return allowedDomains.includes(emailDomain);
}