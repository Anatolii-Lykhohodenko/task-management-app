import { auth } from '@/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// TODO: replace with authenticated session user id when auth is implemented
export async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id;
}

export const rootRoute = '/projects';
