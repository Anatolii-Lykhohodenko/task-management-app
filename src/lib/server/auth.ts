import 'server-only';
import { auth } from '@/auth';

export async function getCurrentUserId(): Promise<number | null> {
  const session = await auth();
  const id = session?.user?.id;
  const parsed = parseInt(id ?? '', 10);
  return isNaN(parsed) ? null : parsed;
}
