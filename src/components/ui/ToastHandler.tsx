'use client';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function ToastHandler({ message }: { message?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shown = useRef(false); // ← добавь

  useEffect(() => {
    if (!message || shown.current) return;
    shown.current = true;

    const messages: Record<string, string> = {
      created: '✓ Task created',
      updated: '✓ Task updated',
      deleted: '✓ Task deleted',
    };

    toast.success(messages[message] ?? message);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`);
  }, [message, pathname, router, searchParams]);

  return null;
}
