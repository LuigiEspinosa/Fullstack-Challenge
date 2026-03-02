import type {
  ReqResUser,
  ReqResUsersResponse,
  SavedUser,
  Post,
  PaginatedPostsResponse,
  CreatePostDto,
  UpdatePostDto,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const REQRES_URL = "https://reqres.in/api";
const REQRES_API_KEY = process.env.NEXT_PUBLIC_REQRES_API_KEY ?? "";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body?.error?.message ?? "Something went wrong.");
  }

  return res.json() as Promise<T>;
}

async function reqresFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${REQRES_URL}${path}`, {
    headers: { "x-api-key": REQRES_API_KEY },
  });
  if (!res.ok) throw new Error("User not found.");
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return apiFetch<{ data: { message: string; role: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return apiFetch<{ data: { message: string } }>("/auth/logout", {
    method: "POST",
  });
}

export async function getReqResUsers(page = 1): Promise<ReqResUsersResponse> {
  return reqresFetch<ReqResUsersResponse>(`/users?page=${page}`);
}

export async function getReqResUser(id: number): Promise<{ data: ReqResUser }> {
  return reqresFetch<{ data: ReqResUser }>(`/users/${id}`);
}

export async function importUser(id: number): Promise<{ data: SavedUser }> {
  return apiFetch<{ data: SavedUser }>(`/users/import/${id}`, {
    method: "POST",
  });
}

export async function getSavedUsers(): Promise<{ data: SavedUser[] }> {
  return apiFetch<{ data: SavedUser[] }>("/users/saved");
}

export async function getPosts(
  page = 1,
  limit = 10,
  search = "",
): Promise<PaginatedPostsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return apiFetch<PaginatedPostsResponse>(`/posts?${params}`);
}

export async function getPost(id: string): Promise<{ data: Post }> {
  return apiFetch<{ data: Post }>(`/posts/${id}`);
}

export async function createPost(dto: CreatePostDto): Promise<{ data: Post }> {
  return apiFetch<{ data: Post }>("/posts", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updatePost(
  id: string,
  dto: UpdatePostDto,
): Promise<{ data: Post }> {
  return apiFetch<{ data: Post }>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function deletePost(id: string): Promise<{ data: Post }> {
  return apiFetch<{ data: Post }>(`/posts/${id}`, {
    method: "DELETE",
  });
}
