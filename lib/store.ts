import { getSupabase } from "./supabase";
import { getRedis, CACHE_KEYS, CACHE_TTL } from "./redis";

export type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  author_id: string;
  likes: number;
  liked_by: string[];
  viewed_by: string[];
  created_at: number;
  views: number;
};

export type Comment = {
  id: string;
  post_id: string;
  author: string;
  author_id: string;
  text: string;
  created_at: number;
};

export type Draft = {
  post_id: string;
  content: string;
  saved_at: number;
};

export type User = {
  id: string;
  username: string;
  password: string;
};

// ─── Users ───────────────────────────────────────────────
export async function createUser(username: string, password: string): Promise<User | null> {
  const db = getSupabase();
  const { data: existing } = await db.from("users").select("id").eq("username", username).maybeSingle();
  if (existing) return null;
  const { data, error } = await db.from("users").insert({ username, password }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function findUser(username: string, password: string): Promise<User | null> {
  const { data } = await getSupabase().from("users").select().eq("username", username).eq("password", password).maybeSingle();
  return data ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await getSupabase().from("users").select().eq("id", id).maybeSingle();
  return data ?? null;
}

// ─── Posts ────────────────────────────────────────────────
export async function getPosts(): Promise<Post[]> {
  const redis = getRedis();
  const cached = await redis.get<Post[]>(CACHE_KEYS.feedPosts);
  if (cached) return cached;
  const { data } = await getSupabase().from("posts").select().order("created_at", { ascending: false });
  const posts = data ?? [];
  await redis.setex(CACHE_KEYS.feedPosts, CACHE_TTL.feed, posts);
  return posts;
}

export async function getPopularPosts(): Promise<Post[]> {
  const redis = getRedis();
  const cached = await redis.get<Post[]>(CACHE_KEYS.popularPosts);
  if (cached) return cached;
  const { data } = await getSupabase().from("posts").select().order("likes", { ascending: false }).limit(3);
  const posts = data ?? [];
  await redis.setex(CACHE_KEYS.popularPosts, CACHE_TTL.popular, posts);
  return posts;
}

export async function getPostById(id: string, viewerId?: string): Promise<Post | undefined> {
  const db = getSupabase();
  const { data: post } = await db.from("posts").select().eq("id", id).maybeSingle();
  if (!post) return undefined;
  if (viewerId && !post.viewed_by.includes(viewerId)) {
    const newViewedBy = [...post.viewed_by, viewerId];
    await db.from("posts").update({ views: post.views + 1, viewed_by: newViewedBy }).eq("id", id);
    return { ...post, views: post.views + 1, viewed_by: newViewedBy };
  }
  return post;
}

export async function createPost(data: { title: string; content: string; author: string; author_id: string }): Promise<Post> {
  const db = getSupabase();
  const { data: post, error } = await db.from("posts").insert({
    ...data, likes: 0, liked_by: [], viewed_by: [], views: 0, created_at: Date.now(),
  }).select().single();
  if (error) throw new Error(error.message);
  await getRedis().del(CACHE_KEYS.feedPosts);
  return post;
}

export async function updatePost(postId: string, authorId: string, data: { title: string; content: string }): Promise<Post | null> {
  const { data: post } = await getSupabase().from("posts").update(data).eq("id", postId).eq("author_id", authorId).select().single();
  if (!post) return null;
  await getRedis().del(CACHE_KEYS.feedPosts);
  return post;
}

export async function toggleLike(postId: string, userId: string): Promise<Post | null> {
  const db = getSupabase();
  const { data: post } = await db.from("posts").select().eq("id", postId).single();
  if (!post) return null;
  const liked = post.liked_by.includes(userId);
  const newLikedBy = liked ? post.liked_by.filter((id: string) => id !== userId) : [...post.liked_by, userId];
  const newLikes = liked ? Math.max(0, post.likes - 1) : post.likes + 1;
  const { data: updated } = await db.from("posts").update({ likes: newLikes, liked_by: newLikedBy }).eq("id", postId).select().single();
  const redis = getRedis();
  await redis.del(CACHE_KEYS.feedPosts);
  await redis.del(CACHE_KEYS.popularPosts);
  return updated ?? null;
}

// ─── Comments ─────────────────────────────────────────────
export async function getComments(postId: string): Promise<Comment[]> {
  const { data } = await getSupabase().from("comments").select().eq("post_id", postId).order("created_at", { ascending: true });
  return data ?? [];
}

export async function addComment(data: { post_id: string; author: string; author_id: string; text: string }): Promise<Comment> {
  const { data: comment, error } = await getSupabase().from("comments").insert({ ...data, created_at: Date.now() }).select().single();
  if (error) throw new Error(error.message);
  return comment;
}

// ─── Drafts (Redis) ───────────────────────────────────────
export async function saveDraft(postId: string, content: string): Promise<Draft> {
  const draft: Draft = { post_id: postId, content, saved_at: Date.now() };
  await getRedis().setex(`draft:${postId}`, 60 * 60 * 24, draft);
  return draft;
}

export async function getDraft(postId: string): Promise<Draft | null> {
  return getRedis().get<Draft>(`draft:${postId}`);
}
