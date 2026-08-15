import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ingestDocument } from '../scripts/ingest';
import fs from 'fs';

import path from 'path';

const router = Router();

// Configure multer for file uploads
const upload = multer({ dest: 'server/data/' });

// Simple shared-secret protection
const adminAuth = (req: Request, res: Response, next: any) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret' });
  }
  next();
};
import { adminLimiter } from '../middlewares/rateLimiter';

router.post('/ingest', adminLimiter, adminAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { subject, chapter } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!subject || !chapter) {
      return res.status(400).json({ error: 'subject and chapter are required fields' });
    }

    const safePath = path.resolve('server/data', path.basename(file.path));

    // Await ingestion
    await ingestDocument(safePath, subject, chapter);

    res.json({ success: true, message: 'Document ingested successfully' });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Ingestion failed', details: error.message });
  } finally {
    if (req.file) {
      const safePath = path.resolve('server/data', path.basename(req.file.path));
      if (fs.existsSync(safePath)) {
        try {
          fs.unlinkSync(safePath);
        } catch (e) {
          console.error('Failed to cleanup file:', e);
        }
      }
    }
  }
});

export default router;
