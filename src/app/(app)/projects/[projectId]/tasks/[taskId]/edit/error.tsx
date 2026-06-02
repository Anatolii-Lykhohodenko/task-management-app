'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function EditTaskError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load task"
      description="We couldn't load this task for editing."
      reset={reset}
    />
  );
}
