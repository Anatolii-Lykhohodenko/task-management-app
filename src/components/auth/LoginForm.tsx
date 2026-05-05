'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type Props = { callbackUrl: string };

export default function LoginForm({ callbackUrl }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, isPending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center">
          <Link href="/projects" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Taskify</p>
              <p className="mt-1 text-xs text-muted-foreground">Workspace</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">Login</CardTitle>
            <CardDescription>
              Enter your email and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={action} className="space-y-4">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {state?.error && (
                <div
                  aria-live="polite"
                  className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {state.error}
                </div>
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-foreground hover:underline"
              >
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
