// Free in-memory token bucket rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipBuckets.get(identifier);

  if (!record || now > record.resetAt) {
    ipBuckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}
