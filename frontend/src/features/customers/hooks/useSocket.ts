'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_URL } from '@/config/env.config';
import { customerKeys } from '@/features/customers/keys';

interface CustomerEvent {
  id: string;
  full_name: string;
  email: string;
}

interface BulkDeleteEvent {
  ids: string[];
}

export function useSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(API_URL);

    socket.on('customer.created', (payload: CustomerEvent) => {
      toast.success(`Customer "${payload.full_name}" created`);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    });

    socket.on('customer.updated', (payload: CustomerEvent) => {
      toast.info(`Customer "${payload.full_name}" updated`);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    });

    socket.on('customer.deleted', () => {
      toast.warning('Customer deleted');
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    });

    socket.on('customers.bulk_deleted', (payload: BulkDeleteEvent) => {
      toast.warning(`${payload.ids.length} customers deleted`);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
