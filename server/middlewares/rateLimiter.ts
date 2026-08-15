import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, number[]>();

export const solverCriticRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Use userId from body if authenticated, otherwise fallback to IP
  const userId = req.body.userId || req.ip;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  let timestamps = rateLimitMap.get(userId) || [];
  
  // Filter out timestamps older than the window
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= 20) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded', 
      message: 'You have reached the maximum of 20 solver-critic requests per hour.' 
    });
  }

  // Record this request
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);

  next();
};
