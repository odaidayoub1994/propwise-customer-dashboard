'use client';

import { toast } from 'sonner';
import {
  useEntitySocket,
  type EntitySocketEvent,
} from '@/hooks/useEntitySocket';
import { customerKeys } from '@/features/customers/keys';
import { SOCKET_EVENTS } from '@/features/customers/socket-events';
import type {
  CustomerSocketPayload,
  BulkDeletedPayload,
} from '@/features/customers/types';

const events: EntitySocketEvent[] = [
  {
    event: SOCKET_EVENTS.CUSTOMER_CREATED,
    handler: (payload, invalidate) => {
      const p = payload as CustomerSocketPayload;
      toast.success(`Customer "${p.full_name}" created`);
      invalidate();
    },
  },
  {
    event: SOCKET_EVENTS.CUSTOMER_UPDATED,
    handler: (payload, invalidate) => {
      const p = payload as CustomerSocketPayload;
      toast.info(`Customer "${p.full_name}" updated`);
      invalidate();
    },
  },
  {
    event: SOCKET_EVENTS.CUSTOMER_DELETED,
    handler: (_payload, invalidate) => {
      toast.warning('Customer deleted');
      invalidate();
    },
  },
  {
    event: SOCKET_EVENTS.CUSTOMERS_BULK_DELETED,
    handler: (payload, invalidate) => {
      const p = payload as BulkDeletedPayload;
      toast.warning(`${p.ids.length} customers deleted`);
      invalidate();
    },
  },
];

export function useSocket() {
  useEntitySocket(customerKeys.all, events);
}
