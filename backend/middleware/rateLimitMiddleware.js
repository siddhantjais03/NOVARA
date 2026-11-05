/**
 * Sliding-Window Rate Limiting Middleware
 * Protects authentication endpoints against brute-force, credential stuffing,
 * and dictionary attacks.
 *
 * ARCHITECTURAL NOTICE & PRODUCTION RECOMMENDATIONS:
 * ----------------------------------------------------
 * 1. Current Implementation (In-Memory Sliding Window):
 *    - Uses a per-process in-memory Map (`ipStore`) to track request timestamps.
 *    - Perfectly suited for single-instance Node.js deployments and development.
 *
 * 2. Limitations of In-Memory Storage:
 *    - In multi-instance or clustered production environments (e.g., PM2 cluster mode,
 *      Kubernetes pods, AWS ECS, Google Cloud Run, horizontal auto-scaling), each Node.js
 *      process maintains its own isolated memory heap.
 *    - A client's requests distributed across N instances effectively multiplies their allowed
 *      requests by N before any single instance triggers a 429 response.
 *    - Process restarts or zero-downtime rolling deployments reset rate-limit counters.
 *
 * 3. Recommended Production Architecture:
 *    - For multi-instance production environments, replace the in-memory Map with a centralized,
 *      high-performance key-value store such as Redis or KeyDB (e.g. `rate-limit-redis` with `ioredis`).
 *    - Alternatively, enforce rate limiting at the ingress/API gateway layer (e.g. Cloudflare
 *      Rate Limiting Rules, AWS WAF, or Nginx `limit_req_zone`) to reject malicious traffic
 *      before it reaches the Node.js application tier.
 */

const ipStore = new Map();

// Periodic cleanup every 5 minutes to discard expired IP buckets
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    // Retain only timestamps still within the max window (15 mins)
    const validTimestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
    if (validTimestamps.length === 0) {
      ipStore.delete(ip);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow the Node process to exit cleanly without waiting for this interval
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Resolve client IP address securely.
 * Relies on Express `req.ip`, which strictly enforces the `trust proxy` configuration.
 * Directly reading unverified `x-forwarded-for` headers is deliberately avoided to prevent
 * clients from spoofing their IP and bypassing rate limiting.
 */
const getClientIp = (req) => {
  const rawIp = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
  // Strip IPv6-mapped IPv4 prefix (e.g., '::ffff:127.0.0.1' -> '127.0.0.1')
  return rawIp.replace(/^.*:/, '');
};

/**
 * Factory for creating custom rate limiters
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
} = {}) => {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();

    if (!ipStore.has(ip)) {
      ipStore.set(ip, { timestamps: [] });
    }

    const record = ipStore.get(ip);

    // Filter out timestamps outside the active sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, max - currentCount);
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    // Standard Rate Limit Headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    if (currentCount >= max) {
      res.setHeader('Retry-After', Math.max(1, resetTime));
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.max(1, resetTime)
      });
    }

    // Record this attempt
    record.timestamps.push(now);
    next();
  };
};

// Configurable defaults for authentication routes
const AUTH_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_ATTEMPTS = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10; // 10 attempts per 15 minutes

export const authLimiter = createRateLimiter({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX_ATTEMPTS,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// Helper for test suites to reset rate limiters
export const resetRateLimits = () => {
  ipStore.clear();
};

