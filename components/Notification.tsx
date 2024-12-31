import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NotificationProps {
  title: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Notification({
  title,
  message,
  variant,
  className,
}: NotificationProps) {
  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
