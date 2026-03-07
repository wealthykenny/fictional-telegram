const memoryStore = new Map();

export function checkRateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = memoryStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  memoryStore.set(key, entry);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count)
  };
}
