import { NextFunction, Request, Response } from 'express';

interface RateLimitConfig {
  perMinute?: number | null;
  perHour?: number | null;
  perDay?: number | null;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitWindow {
  minute: RateLimitEntry[];
  hour: RateLimitEntry[];
  day: RateLimitEntry[];
}

const getGlobalRateLimitConfig = (): RateLimitConfig => ({
  perMinute: process.env.RATE_LIMIT_PER_MINUTE
    ? parseInt(process.env.RATE_LIMIT_PER_MINUTE, 10)
    : null,
  perHour: process.env.RATE_LIMIT_PER_HOUR ? parseInt(process.env.RATE_LIMIT_PER_HOUR, 10) : null,
  perDay: process.env.RATE_LIMIT_PER_DAY ? parseInt(process.env.RATE_LIMIT_PER_DAY, 10) : null,
});

const rateLimitStore = new Map<string, RateLimitWindow>();

setInterval(
  () => {
    const now = Date.now();
    for (const [key, window] of rateLimitStore.entries()) {
      window.minute = window.minute.filter((entry) => entry.resetAt > now - 2 * 60 * 1000);
      window.hour = window.hour.filter((entry) => entry.resetAt > now - 2 * 60 * 60 * 1000);
      window.day = window.day.filter((entry) => entry.resetAt > now - 2 * 24 * 60 * 60 * 1000);
      if (window.minute.length === 0 && window.hour.length === 0 && window.day.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

function getClientIdentifier(req: Request): string {
  const customId = req.headers['x-client-id'] as string;
  if (customId) {
    return customId;
  }
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0]
    : req.ip;
  return ip || 'unknown';
}

function checkRateLimit(
  window: RateLimitEntry[],
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recentEntries = window.filter((entry) => entry.resetAt > windowStart);
  const currentCount = recentEntries.reduce((sum, entry) => sum + entry.count, 0);
  if (currentCount >= limit) {
    const earliestReset = Math.min(...recentEntries.map((e) => e.resetAt));
    return {
      allowed: false,
      remaining: 0,
      resetAt: earliestReset,
    };
  }
  return {
    allowed: true,
    remaining: limit - currentCount,
    resetAt: now + windowMs,
  };
}

function recordRequest(key: string, now: number): void {
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { minute: [], hour: [], day: [] });
  }
  const window = rateLimitStore.get(key)!;
  window.minute.push({ count: 1, resetAt: now + 60 * 1000 });
  window.hour.push({ count: 1, resetAt: now + 60 * 60 * 1000 });
  window.day.push({ count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const config = getGlobalRateLimitConfig();
  if (!config.perMinute && !config.perHour && !config.perDay) {
    return next();
  }
  const identifier = getClientIdentifier(req);
  const key = identifier;
  const now = Date.now();
  const checks: Array<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    limit: number;
    window: string;
  }> = [];
  if (config.perMinute) {
    const window = rateLimitStore.get(key)?.minute || [];
    const check = checkRateLimit(window, config.perMinute, 60 * 1000);
    checks.push({ ...check, limit: config.perMinute, window: 'minute' });
  }
  if (config.perHour) {
    const window = rateLimitStore.get(key)?.hour || [];
    const check = checkRateLimit(window, config.perHour, 60 * 60 * 1000);
    checks.push({ ...check, limit: config.perHour, window: 'hour' });
  }
  if (config.perDay) {
    const window = rateLimitStore.get(key)?.day || [];
    const check = checkRateLimit(window, config.perDay, 24 * 60 * 60 * 1000);
    checks.push({ ...check, limit: config.perDay, window: 'day' });
  }
  const exceeded = checks.find((check) => !check.allowed);
  if (exceeded) {
    const resetTime = new Date(exceeded.resetAt).toISOString();
    res.setHeader('X-RateLimit-Limit', exceeded.limit.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', resetTime);
    res.setHeader('Retry-After', Math.ceil((exceeded.resetAt - now) / 1000).toString());
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Rate limit exceeded: ${exceeded.limit} requests per ${exceeded.window} allowed`,
      retryAfter: Math.ceil((exceeded.resetAt - now) / 1000),
      resetAt: resetTime,
    });
  }
  recordRequest(key, now);
  const mostRestrictive = checks.reduce(
    (
      prev: { allowed: boolean; remaining: number; resetAt: number; limit: number; window: string },
      curr: { allowed: boolean; remaining: number; resetAt: number; limit: number; window: string },
    ) => (curr.remaining < prev.remaining ? curr : prev),
    { allowed: true, remaining: Infinity, resetAt: Infinity, limit: Infinity, window: 'minute' },
  );
  if (mostRestrictive) {
    res.setHeader('X-RateLimit-Limit', mostRestrictive.limit.toString());
    res.setHeader('X-RateLimit-Remaining', mostRestrictive.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(mostRestrictive.resetAt).toISOString());
  }
  next();
}

export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

export function getRateLimitStatus(identifier: string): RateLimitWindow | null {
  return rateLimitStore.get(identifier) || null;
}
