import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

export function generateAdminToken() {
  return jwt.sign(
    {
      role: 'admin',
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
}

export function verifyAdminToken(token?: string) {
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}
