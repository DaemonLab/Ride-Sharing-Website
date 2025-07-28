import { config } from 'dotenv';

config();

export const isEmailAllowed = (email) => {
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    const emailDomain = email?.split('@')[1].toLowerCase();
    return allowedDomains.includes(emailDomain);
}