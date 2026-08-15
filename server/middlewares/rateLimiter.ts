import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Global Rate Limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded your request limit. Please try again later.'
  }
});

// AI endpoints Rate Limiter: 20 requests per hour
export const solverCriticRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per `window` (here, per 1 hour)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded',
    message: 'You have reached the maximum of 20 solver-critic requests per hour.'
  },
  keyGenerator: (req, res) => {
    // Use userId from body if authenticated, otherwise fallback to standard IP
    if (req.body.userId) return req.body.userId;
    return ipKeyGenerator(req, res);
  }
});

// Admin endpoints Rate Limiter: 50 requests per hour
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many admin requests. Please try again later.'
  }
});
