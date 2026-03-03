"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PostForm, type PostFormValues } from "@/components/post-form";
import { getPost, updatePost } from "@/lib/api";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (isError || !data)
    return <p className="text-sm text-muted-foreground">Post not found.</p>;

  const post = data.data;

  async function handleSubmit(values: PostFormValues) {
    await updatePost(id, values);
    void queryClient.invalidateQueries({ queryKey: ["post", id] });
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post updated.");
    router.push(`/posts/${id}`);
  }

  return (
    <>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="rounded-lg border p-6 bg-white mt-8 mx-auto">
        <h1 className="mb-6 text-xl font-bold">Edit Post</h1>
        <PostForm
          defaultValues={{
            title: post.title,
            content: post.content,
            authorUserId: post.author_user_id,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </>
  );
}
