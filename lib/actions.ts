"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createUser, findUser, addComment, createPost, saveDraft, toggleLike, updatePost } from "./store";
import { clearSession, getSession, setSession } from "./session";

export async function registerAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  if (!username || !password) throw new Error("Бүх талбарыг бөглөнө үү");
  const user = await createUser(username, password);
  if (!user) throw new Error("Хэрэглэгчийн нэр аль хэдийн бүртгэлтэй байна");
  await setSession(user.id);
  redirect("/feed");
}

export async function loginAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  if (!username || !password) throw new Error("Бүх талбарыг бөглөнө үү");
  const user = await findUser(username, password);
  if (!user) throw new Error("Нэр эсвэл нууц үг буруу байна");
  await setSession(user.id);
  redirect("/feed");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createPostAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Нэвтрэх шаардлагатай");
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  if (!title || !content) throw new Error("Бүх талбарыг бөглөнө үү");
  await new Promise((r) => setTimeout(r, 600));
  if (Math.random() < 0.05) throw new Error("Серверийн алдаа. Дахин оролдоно уу.");
  const post = await createPost({ title, content, author: session.username, author_id: session.id });
  revalidatePath("/feed");
  return post;
}

export async function updatePostAction(postId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Нэвтрэх шаардлагатай");
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  if (!title || !content) throw new Error("Бүх талбарыг бөглөнө үү");
  const post = await updatePost(postId, session.id, { title, content });
  if (!post) throw new Error("Засах эрх байхгүй");
  revalidatePath(`/post/${postId}`);
  revalidatePath("/feed");
  return post;
}

export async function addCommentAction(postId: string, text: string) {
  const session = await getSession();
  if (!session) throw new Error("Нэвтрэх шаардлагатай");
  if (!text?.trim()) throw new Error("Сэтгэгдэл хоосон байна");
  await new Promise((r) => setTimeout(r, 400));
  if (Math.random() < 0.05) throw new Error("Илгээхэд алдаа гарлаа");
  const comment = await addComment({ post_id: postId, author: session.username, author_id: session.id, text });
  revalidatePath(`/post/${postId}`);
  return comment;
}

export async function toggleLikeAction(postId: string) {
  const session = await getSession();
  if (!session) throw new Error("Нэвтрэх шаардлагатай");
  await new Promise((r) => setTimeout(r, 200));
  const post = await toggleLike(postId, session.id);
  if (!post) throw new Error("Post олдсонгүй");
  revalidatePath(`/post/${postId}`);
  revalidatePath("/feed");
  return post;
}

export async function saveDraftAction(postId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Нэвтрэх шаардлагатай");
  return saveDraft(postId, content);
}
