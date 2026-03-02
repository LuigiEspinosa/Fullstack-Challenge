export interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ReqResUsersResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqResUser[];
}

export interface SavedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  role: "ADMIN" | "USER";
  saved_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPostsResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePostDto {
  title: string;
  content: string;
  authorUserId: number;
}

export type UpdatePostDto = Partial<CreatePostDto>;
