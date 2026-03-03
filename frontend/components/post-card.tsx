import type { Post } from "@/lib/types";

interface Props {
  post: Post;
}

export function PostCard({ post }: Props) {
  return (
    <div className="post-card rounded-lg border bg-white p-4 transition-colors hover:bg-zinc-50">
      <p className="mb-1 text-xs text-muted-foreground">
        Author #{post.author_user_id} - {new Date(post.created_at).toLocaleDateString()}
      </p>
      <h2 className="font-semibold leading-tight">{post.title}</h2>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {post.content}
      </p>
    </div>
  );
}
