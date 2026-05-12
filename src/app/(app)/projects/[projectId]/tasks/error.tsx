'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function TasksError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen description="Failed to load tasks data" reset={reset} />
  );
}
