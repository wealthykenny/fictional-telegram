import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const COOKIE_NAME = 'knight_session';

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function passwordPolicy(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,128}$/.test(password);
}

export function signSession(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      organizationId: user.organization_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h', issuer: 'the-knight-of-order', audience: 'member-portal' }
  );
}

export function verifySession(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: 'the-knight-of-order', audience: 'member-portal' });
}

export function buildCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=28800`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`;
}

export function readToken(headers = {}) {
  const cookieHeader = headers.cookie || headers.Cookie || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1] || null;
}

export function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}
