const Redis = require('ioredis');

let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });
  redis.on('connect', () => console.log('Redis Connected'));
  redis.on('error', (err) => console.log('Redis error (non-blocking):', err.message));
} else {
  redis = null;
  console.log('Redis not configured - notifications will work without caching');
}

module.exports = redis;
