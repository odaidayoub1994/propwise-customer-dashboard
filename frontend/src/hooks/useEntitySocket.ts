'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketInstance } from '@/context/SocketContext';

export interface EntitySocketEvent {
  event: string;
  handler: (payload: unknown, invalidate: () => void) => void;
}

export function useEntitySocket(
  queryKey: readonly unknown[],
  events: EntitySocketEvent[],
) {
  const socket = useSocketInstance();
  const queryClient = useQueryClient();
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!socket) return;

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey });

    const listeners: [string, (payload: unknown) => void][] = [];

    for (const { event, handler } of eventsRef.current) {
      const listener = (payload: unknown) => handler(payload, invalidate);
      socket.on(event, listener);
      listeners.push([event, listener]);
    }

    return () => {
      for (const [event, listener] of listeners) {
        socket.off(event, listener);
      }
    };
  }, [socket, queryClient, queryKey]);
}
