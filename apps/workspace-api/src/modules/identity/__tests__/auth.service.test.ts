import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthTransactionRepository } from '../repositories/auth-transaction.repository';
import { JwtService } from '../services/jwt.service';
import bcrypt from 'bcrypt';

vi.mock('../repositories/user.repository');
vi.mock('../repositories/auth-transaction.repository');
vi.mock('../services/jwt.service');
vi.mock('bcrypt');
vi.mock('../../../utils/env', () => ({
  env: {
    JWT_SECRET: 'test',
    JWT_REFRESH_EXPIRES_IN: '7d'
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    vi.mocked(JwtService.generateRefreshToken).mockReturnValue('refresh');
    vi.mocked(JwtService.hashRefreshToken).mockReturnValue('refresh-hash');
    
    vi.mocked(AuthTransactionRepository.registerWithDefaults).mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' } as any,
      org: { id: 'o1', name: 'Test Org' } as any,
      session: { id: 's1' } as any
    });

    vi.mocked(JwtService.generateAccessToken).mockReturnValue('access');

    const result = await AuthService.register({
      email: 'test@example.com',
      password: 'password',
      orgName: 'Test Org'
    });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should reject registration if email exists', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValue({ id: 'u1' } as any);

    await expect(AuthService.register({
      email: 'test@example.com',
      password: 'password',
      orgName: 'Test'
    })).rejects.toThrow('User already exists');
  });
});
