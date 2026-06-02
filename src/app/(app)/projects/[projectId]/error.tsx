'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function ProjectError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="Failed to load project"
      description="We couldn't load this project. It may have been deleted or you don't have access."
      reset={reset}
    />
  );
}
