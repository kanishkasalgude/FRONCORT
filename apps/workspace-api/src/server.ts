import app from './app';
import { env } from './utils/env';
import { DigestScheduler } from './modules/digest/scheduler/digest.scheduler';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Workspace API] Server is running on port ${PORT}`);
  DigestScheduler.start();
});
