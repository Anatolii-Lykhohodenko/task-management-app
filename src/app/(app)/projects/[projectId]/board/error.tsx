'use client';

import ErrorScreen from "@/components/ui/ErrorScreen";


export default function BoardError({ reset }: { reset: () => void }) {
  return <ErrorScreen description="Failed to load tasks board" reset={reset} />;
}