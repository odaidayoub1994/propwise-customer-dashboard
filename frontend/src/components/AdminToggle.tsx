'use client';

import { Lock, LockOpen } from 'lucide-react';
import { useAdminMode } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';

export function AdminToggle() {
  const { isInternal, toggle } = useAdminMode();

  return (
    <Button
      variant={isInternal ? 'default' : 'outline'}
      onClick={toggle}
      className={
        isInternal
          ? 'bg-amber-500 text-white hover:bg-amber-600'
          : undefined
      }
    >
      {isInternal ? (
        <LockOpen className="mr-2 h-4 w-4" />
      ) : (
        <Lock className="mr-2 h-4 w-4" />
      )}
      {isInternal ? 'Admin Mode' : 'Public Mode'}
    </Button>
  );
}
