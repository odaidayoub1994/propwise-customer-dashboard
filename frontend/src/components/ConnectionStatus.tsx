'use client';

import { useSocketStatus } from '@/context/SocketContext';
import { Badge } from '@/components/ui/badge';

export function ConnectionStatus() {
  const status = useSocketStatus();

  if (status === 'connected') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="destructive" className="gap-2 px-3 py-1.5 text-xs">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        {status === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
      </Badge>
    </div>
  );
}
