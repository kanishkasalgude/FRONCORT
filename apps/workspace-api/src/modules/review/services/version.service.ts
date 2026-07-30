import { PRVersionRepository } from '../repositories/pr-version.repository';

export class VersionService {
  static async createVersion(prId: string) {
    return PRVersionRepository.createVersion(prId);
  }
}
