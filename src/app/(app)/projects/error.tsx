'use client';

import ErrorScreen from '@/components/ui/ErrorScreen';

export default function ProjectsError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen description="Failed to load projects data" reset={reset} />
  );
}
