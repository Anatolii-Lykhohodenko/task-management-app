'use client';

import ErrorScreen from "@/components/ui/ErrorScreen";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen description="Failed to load dashboard data" reset={reset} />
  );
}
