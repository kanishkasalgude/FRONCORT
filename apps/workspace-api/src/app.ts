import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { prisma } from '@workspace/database';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
