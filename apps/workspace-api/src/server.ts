import app from './app';
import { env } from './utils/env';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Workspace API] Server is running on port ${PORT}`);
});
