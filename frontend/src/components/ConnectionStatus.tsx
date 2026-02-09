'use client';

import { useSocketStatus } from '@/context/SocketContext';
import { Badge } from '@/components/ui/badge';

export function ConnectionStatus() {
  const status = useSocketStatus();

  if (status === 'connected') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="outline" className="gap-2 border-yellow-500 bg-yellow-50 px-3 py-1.5 text-xs text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
        </span>
        {status === 'reconnecting' ? 'Reconnecting...' : 'Live updates paused'}
      </Badge>
    </div>
  );
}
