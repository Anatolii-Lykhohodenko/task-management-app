import 'server-only';
import { auth } from '@/auth';

// TODO: replace with authenticated session user id when auth is implemented
export async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id;
}
