'use client';
import { login } from "@/server/actions/auth";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();
  return (
    <div>
      <form action={action}>
        <h2>Login</h2>

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          required
          autoComplete="email"
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          required
        />
        <input
          type="hidden"
          name="callbackUrl"
          value={searchParams.get('callbackUrl') ?? '/projects'}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Logging in...' : 'Login'}
        </button>
        {state?.error && (
          <p aria-live="polite" style={{ color: 'red' }}>
            {state.error}
          </p>
        )}
      </form>

      <Link
        href={`/auth/register?callbackUrl=${encodeURIComponent(
          searchParams.get('callbackUrl') ?? '/projects'
        )}`}
      >
        Don&apos;t have an account? Register
      </Link>
      {/* <Link href="/auth/forgot-password">Forgot your password?</Link> TODO */}
    </div>
  );
}