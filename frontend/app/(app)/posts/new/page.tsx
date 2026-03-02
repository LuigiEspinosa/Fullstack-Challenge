"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PostForm, type PostFormValues } from "@/components/post-form";
import { createPost } from "@/lib/api";

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Per requirements, Each post must include:
   *   - id
   *   - title
   *   - content/body
   *   - authorUserId (link to a saved user or a ReqRes user ID)
   *   - createdAt / updatedAt
   */
  async function handleSubmit(data: PostFormValues) {
    await createPost(data);
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post created.");
    router.push("/posts");
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
      <div className="max-w-xl space-y-6 mx-auto mt-8">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="mb-6 text-xl font-bold">Create Post</h1>
          <PostForm onSubmit={handleSubmit} submitLabel="Create Post" />
        </div>
      </div>
    </>
  );
}
