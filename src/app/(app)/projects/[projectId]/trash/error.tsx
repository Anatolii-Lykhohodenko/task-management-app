'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function TrashError({ reset }: { reset: () => void }) {
  return <ErrorScreen description="Failed to load trash" reset={reset} />;
}
