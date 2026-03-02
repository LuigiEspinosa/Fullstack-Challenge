'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGsapContext } from '@/hooks/use-gsap-context';
import { login } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();

  const containerRef = useGsapContext<HTMLDivElement>(() => {
    gsap.from('.login-card', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'power2.out',
    });
  });

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Invalid credentials.',
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className='flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900'
    >
      <Card className='login-card w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4'
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder='eve.holt@reqres.in'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
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
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
