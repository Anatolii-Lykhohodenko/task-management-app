'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function EditProjectError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load project"
      description="We couldn't load the project for editing."
      reset={reset}
    />
  );
}
