"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedBadge } from "@/components/saved-badge";
import { getReqResUser, getSavedUsers, importUser } from "@/lib/api";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: reqResData, isLoading, isError } = useQuery({
    queryKey: ["reqres-user", userId],
    queryFn: () => getReqResUser(userId),
    retry: false,
  });

  const { data: savedData } = useQuery({
    queryKey: ["saved-users"],
    queryFn: getSavedUsers,
  });

  const isSaved = (savedData?.data ?? []).some((u) => u.id === userId);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => importUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["saved-users"] });
      toast.success("User saved locally.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  if (isError || !reqResData) {
    return <p className="text-sm text-muted-foreground">User not found.</p>
  }

  const user = reqResData.data;

  return (
    <div className="max-w-md space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-5 rounded-lg border bg-white p-6">
        <div className="flex items-center gap-4">
          <Image
            src={user.avatar}
            alt={`${user.first_name} ${user.last_name}`}
            width={80}
            height={80}
            className="rounded-full ring-2 ring-zinc-100"
          />
          <div>
            <h1 className="text-xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          {isSaved ? (
            <SavedBadge />
          ) : (
            <Button size="sm" disabled={isPending} onClick={() => save()}>
              {isPending ? "Saving..." : "Save User"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
