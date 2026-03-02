"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import gsap from "gsap";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PostCard } from "@/components/post-card";
import { getPosts, deletePost } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useGsapContext } from "@/hooks/use-gsap-context";
import type { PaginatedPostsResponse } from "@/lib/types";

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const debounceSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["posts", page, debounceSearch],
    queryFn: () => getPosts(page, 10, debounceSearch),
    placeholderData: (prev) => prev,
  });

  const gridRef = useGsapContext<HTMLDivElement>(() => {
    gsap.from(".post-card", {
      opacity: 0,
      y: 20,
      stagger: 0.06,
      ease: "power2.out",
    });
  });

  const { mutate: remove } = useMutation({
    mutationFn: deletePost,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData<PaginatedPostsResponse>([
        "posts",
        page,
        debounceSearch,
      ]);
      queryClient.setQueryData<PaginatedPostsResponse>(
        ["posts", page, debounceSearch],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((p) => p.id !== id),
            meta: { ...old.meta, total: old.meta.total - 1 },
          };
        },
      );
      return { previous };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["posts", page, debounceSearch],
          context.previous,
        );
      }
      toast.error(err.message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-2xl font-bold">Posts</h1>
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to page 1 on every new search
          }}
          className="max-w-xs"
        />
        <Button asChild size="sm">
          <Link href="/posts/new">
            <Plus className="mr-1 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading posts...</p>
      )}

      {!isLoading && data?.data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {debounceSearch
            ? "No posts match yor search."
            : "No posts yet. Create the first one!"}
        </p>
      )}

      <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.data ?? []).map((post) => (
          <div key={post.id} className="group relative">
            <Link href={`/posts/${post.id}`}>
              <PostCard post={post} />
            </Link>
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Admin role is required.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => remove(post.id)}
                  >
                    Delete
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total}{" "}
            total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
