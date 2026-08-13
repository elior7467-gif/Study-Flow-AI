import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config/env';
import apiRoutes from './server/routes/api.routes';
import { errorHandler } from './server/middlewares/errorHandler';

async function startServer() {
  const app = express();
  
  app.use(express.json());

  // Mount API Routes
  app.use('/api', apiRoutes);

  // Vite middleware in dev mode
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler (must be after routes)
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`StudyFlow AI server listening on port ${config.port}`);
  });
}

startServer();
