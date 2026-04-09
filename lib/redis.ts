import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new Error("Redis env variables missing");
    _redis = new Redis({ url, token });
  }
  return _redis;
}

export const CACHE_KEYS = {
  popularPosts: "popular_posts",
  feedPosts: "feed_posts",
};

export const CACHE_TTL = {
  popular: 60,
  feed: 10,
};
