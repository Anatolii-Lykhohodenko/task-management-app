'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function TaskError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load task"
      description="We couldn't load this task. It may have been deleted or moved to trash."
      reset={reset}
    />
  );
}
