type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

/**
 * Límite de peticiones básico, en memoria y por instancia de servidor.
 *
 * Limitación conocida: en Vercel cada función corre en su propia instancia, así que
 * el límite real se multiplica por el número de instancias y se reinicia en cada
 * arranque en frío. Es una protección best-effort contra ráfagas desde una misma IP,
 * no un control de abuso distribuido. Si algún día hace falta protección real,
 * hay que sustituir este módulo por un almacén compartido (p. ej. Vercel KV).
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Purga las claves caducadas para que el Map no crezca sin límite.
  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    lastSweep = now;
    for (const [existingKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(existingKey);
    }
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}
