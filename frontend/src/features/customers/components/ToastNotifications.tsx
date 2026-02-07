'use client';

import { useSocket } from '@/features/customers/hooks/useSocket';

export function ToastNotifications() {
  useSocket();
  return null;
}
