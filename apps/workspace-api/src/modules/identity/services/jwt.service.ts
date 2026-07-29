import jwt from 'jsonwebtoken';
import { env } from '../../../utils/env';
import { Role } from '@workspace/database';
import crypto from 'crypto';

export interface JwtPayload {
  userId: string;
  sessionId: string;
  activeOrgId: string;
  role: Role;
}

export class JwtService {
  /**
   * Generates a short-lived access token.
   */
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Generates a cryptographically secure refresh token (not a JWT).
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Verifies an access token and returns the payload.
   */
  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  /**
   * Hashes a refresh token for safe storage in the database (SHA-256).
   */
  static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
