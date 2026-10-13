import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        // Exponential backoff with ceiling
        return Math.min(times * 100, 3000);
      },
    });

    redisClient.on("error", (err) => {
      // Log connection error without crashing the main web process if Redis is starting up
      if (process.env.NODE_ENV !== "test") {
        console.warn("[Redis] Connection notice:", err.message);
      }
    });
  }

  return redisClient;
}
