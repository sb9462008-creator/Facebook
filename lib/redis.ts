import { Redis } from "@upstash/redis";

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis env variables missing");
  return new Redis({ url, token });
}

export const CACHE_KEYS = {
  popularPosts: "popular_posts",
  feedPosts: "feed_posts",
};

export const CACHE_TTL = {
  popular: 60,
  feed: 10,
};
