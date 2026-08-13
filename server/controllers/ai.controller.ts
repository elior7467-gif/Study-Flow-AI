import { Request, Response, NextFunction } from 'express';
import { AiService } from '../services/ai.service';

export const handleSolverCritic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, subject = 'JEE/NEET Physics • Laws of Motion (NCERT Ch 5)' } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const resultData = await AiService.generateSolverCritic(query, subject);
    
    res.json({
      id: 'sol-' + Date.now(),
      query,
      subject,
      ...resultData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

export const handleAuditTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topicTitle, subtitle, unit } = req.body;
    
    if (!topicTitle || !unit) {
      return res.status(400).json({ error: 'topicTitle and unit are required' });
    }

    const resultData = await AiService.generateTopicAudit(topicTitle, subtitle || '', unit);
    res.json(resultData);
  } catch (err) {
    next(err);
  }
};
