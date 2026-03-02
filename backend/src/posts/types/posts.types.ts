interface Posts {
  id: string;
  title: string;
  content: string;
  author_user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostsReponse {
  data: Posts;
}

export interface GetPostsReponse {
  data: Posts[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
