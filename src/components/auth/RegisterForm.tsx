'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { register } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = { callbackUrl: string };

function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function RegisterForm({ callbackUrl }: Props) {
  const [state, action, isPending] = useActionState(register, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/projects" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              T
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Taskify</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Workspace</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl tracking-tight">
              Create account
            </CardTitle>
            <CardDescription className="text-sm">
              Enter your details to get started.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={action} className="space-y-4">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm">
                  Confirm password
                </Label>
                <PasswordInput
                  id="confirm-password"
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
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
                {isPending ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-foreground hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
