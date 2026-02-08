'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocketInstance } from '@/context/SocketContext';
import { customerKeys } from '@/features/customers/keys';
import { SOCKET_EVENTS } from '@/features/customers/socket-events';
import type {
  CustomerSocketPayload,
  BulkDeletedPayload,
} from '@/features/customers/types';

export function useSocket() {
  const socket = useSocketInstance();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.all });

    const onCreated = (payload: CustomerSocketPayload) => {
      toast.success(`Customer "${payload.full_name}" created`);
      invalidate();
    };

    const onUpdated = (payload: CustomerSocketPayload) => {
      toast.info(`Customer "${payload.full_name}" updated`);
      invalidate();
    };

    const onDeleted = () => {
      toast.warning('Customer deleted');
      invalidate();
    };

    const onBulkDeleted = (payload: BulkDeletedPayload) => {
      toast.warning(`${payload.ids.length} customers deleted`);
      invalidate();
    };

    socket.on(SOCKET_EVENTS.CUSTOMER_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.CUSTOMER_UPDATED, onUpdated);
    socket.on(SOCKET_EVENTS.CUSTOMER_DELETED, onDeleted);
    socket.on(SOCKET_EVENTS.CUSTOMERS_BULK_DELETED, onBulkDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.CUSTOMER_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.CUSTOMER_UPDATED, onUpdated);
      socket.off(SOCKET_EVENTS.CUSTOMER_DELETED, onDeleted);
      socket.off(SOCKET_EVENTS.CUSTOMERS_BULK_DELETED, onBulkDeleted);
    };
  }, [socket, queryClient]);
}
