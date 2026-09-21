type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Protección básica por instancia. En producción multi-instancia debe sustituirse
// por un almacén distribuido (por ejemplo, Redis o un servicio equivalente).
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}
