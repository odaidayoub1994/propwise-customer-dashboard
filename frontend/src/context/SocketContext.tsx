'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from '@/config/env.config';

type SocketStatus = 'connected' | 'disconnected' | 'reconnecting';

interface SocketContextValue {
  socket: Socket | null;
  status: SocketStatus;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  status: 'disconnected',
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket>(() => io(API_URL, { autoConnect: false }));
  const [status, setStatus] = useState<SocketStatus>('disconnected');

  useEffect(() => {
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onReconnectAttempt = () => setStatus('reconnecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext value={{ socket, status }}>
      {children}
    </SocketContext>
  );
}

export function useSocketInstance(): Socket | null {
  return useContext(SocketContext).socket;
}

export function useSocketStatus(): SocketStatus {
  return useContext(SocketContext).status;
}
