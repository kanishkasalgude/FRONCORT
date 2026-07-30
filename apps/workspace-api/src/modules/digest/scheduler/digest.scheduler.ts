import cron from 'node-cron';
import { DigestService } from '../services/digest.service';

export class DigestScheduler {
  private static task: any = null;

  static start() {
    // Protect against accidental double registration
    if (this.task) {
      console.log('[DigestScheduler] Scheduler is already running.');
      return;
    }

    // Every hour at minute 0: '0 * * * *'
    this.task = cron.schedule('0 * * * *', async () => {
      console.log('[DigestScheduler] Running scheduled digest generation...');
      try {
        await DigestService.generateDigests();
        console.log('[DigestScheduler] Digest generation complete.');
      } catch (error) {
        // Scheduler survives exception
        console.error('[DigestScheduler] Exception during digest execution:', error);
      }
    });

    console.log('[DigestScheduler] Started hourly digest scheduler.');
  }

  static stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('[DigestScheduler] Stopped digest scheduler.');
    }
  }

  // Trigger manually for testing
  static async runNow() {
    await DigestService.generateDigests();
  }
}
