"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSavedUsers } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  authorUserId: z.number().int().positive("Please select an author."),
});

export type PostFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<PostFormValues>;
  onSubmit: (data: PostFormValues) => Promise<void>;
  submitLabel?: string;
}

export function PostForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
}: Props) {
  const { data: savedUsersData } = useQuery({
    queryKey: ["saved-users"],
    queryFn: getSavedUsers,
    staleTime: 60_000,
  });

  const form = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      authorUserId: defaultValues?.authorUserId,
    },
  });

  async function handleSubmit(data: PostFormValues) {
    try {
      await onSubmit(data);
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  const savedUsers = savedUsersData?.data ?? [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your post content..."
                  className="min-h-32 resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authorUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <select
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={(node) => {
                    if (typeof field.ref === "function") field.ref(node);
                  }}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    field.onChange(isNaN(n) ? undefined : n);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {field.value &&
                    !savedUsers.find((u) => u.id === field.value)
                      ? `Author #${field.value} (not in saved users)`
                      : "Select an author..."}
                  </option>
                  {savedUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              {savedUsers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No saved user yet. Visit Users and save on first.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
