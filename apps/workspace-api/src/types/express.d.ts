import { Role } from '@workspace/database';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        sessionId: string;
        activeOrgId: string;
        role: Role;
      };
      activeOrgId?: string; // Sometimes populated early before full resolution
    }
  }
}

export {};
