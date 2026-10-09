/**
 * Express Full-Stack Server
 * Mounts 3-Tier Layered API architecture and integrates Vite dev middleware.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index';
import { config } from './config/index';
import { logger } from './src/utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request Layer Logger
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      logger.info('MIDDLEWARE', `${req.method} ${req.path}`);
    }
    next();
  });

  // Mount clean architecture API routes
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Vite middleware mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = config.port || 3000;
  app.listen(port, '0.0.0.0', () => {
    logger.info('CONFIG', `Clean Architecture server online at http://0.0.0.0:${port}`);
    logger.info('CONFIG', `API endpoints accessible at http://0.0.0.0:${port}/api/v1`);
  });
}

startServer().catch((err) => {
  logger.error('CONFIG', `Server startup failed: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
