import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <>
      <h1>Unauthorized</h1>
      <Link href={'/auth/register'}>Login</Link>
      <Link href={'/auth/register'}>Don&apos;t have an account? Register</Link>
    </>
  );
}
