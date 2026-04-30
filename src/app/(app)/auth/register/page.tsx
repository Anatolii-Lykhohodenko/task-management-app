'use client';
import { register } from '@/server/actions/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(register, null);
  const searchParams = useSearchParams();

  return (
    <div>
      <form action={action}>
        <h2>Register</h2>

        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" required autoComplete="name" />
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
          autoComplete="new-password"
          required
        />
        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          type="password"
          name="confirm-password"
          id="confirm-password"
          autoComplete="new-password"
          required
        />
        <input
          type="hidden"
          name="callbackUrl"
          value={searchParams.get('callbackUrl') ?? '/projects'}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Registering...' : 'Register'}
        </button>
        {state?.error && (
          <p aria-live="polite" style={{ color: 'red' }}>
            {state.error}
          </p>
        )}
      </form>

      <Link
        href={`/auth/login?callbackUrl=${encodeURIComponent(
          searchParams.get('callbackUrl') ?? '/projects'
        )}`}
      >
        Already have an account? Login
      </Link>
    </div>
  );
}
