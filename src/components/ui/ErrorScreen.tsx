import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type Props = {
  title?: string;
  description?: string;
  reset: () => void;
};

export default function ErrorScreen({
  title = 'Something went wrong',
  description = 'Failed to load data',
  reset,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
