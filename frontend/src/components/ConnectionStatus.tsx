'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useSocketStatus } from '@/context/SocketContext';

export function ConnectionStatus() {
  const status = useSocketStatus();

  const isConnected = status === 'connected';

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
        isConnected
          ? 'text-muted-foreground'
          : 'text-yellow-600 dark:text-yellow-400'
      }`}
    >
      {isConnected ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span className="flex items-center gap-2">
        {isConnected
          ? 'Connected'
          : status === 'reconnecting'
            ? 'Reconnecting...'
            : 'Disconnected'}
        {!isConnected && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
          </span>
        )}
      </span>
    </div>
  );
}
