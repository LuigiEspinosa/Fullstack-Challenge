'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  title: z.string().min(3, 'Title must be at lest 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  authorUserId: z.coerce.number().int().positive('Enter a valid ReqRes user ID (1-12).'),
});

export type PostFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<PostFormValues>;
  onSubmit?: (data: PostFormValues) => Promise<void>;
  submitLabel?: string;
}

export function PostForm({ defaultValues, onSubmit, submitLabel = 'Save' }: Props) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      content: defaultValues?.content ?? '',
      authorUserId: defaultValues?.authorUserId ?? ('' as unknown as number),
    }
  });

  async function handleSubmit(data: PostFormValues) {
    try {
      await onSubmit(data);
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex flex-col gap-4'
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='My post title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='content'
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
          name='authorUserId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author ID</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  min={1}
                  placeholder='Your ReqRes user ID (1-12)'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className='text-sm text-destructive'>
            {form.formState.errors.root.message}
          </p>
        )}
        <Button
          type='submit'
          disabled={form.formState.isSubmitting}
          className='w-full'
        >
          {form.formState.isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
