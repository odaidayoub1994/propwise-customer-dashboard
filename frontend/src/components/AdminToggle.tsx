'use client';

import { Lock, LockOpen } from 'lucide-react';
import { useAdminMode } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';

interface AdminToggleProps {
  variant?: 'default' | 'sidebar';
}

export function AdminToggle({ variant = 'default' }: AdminToggleProps) {
  const { isInternal, toggle } = useAdminMode();

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isInternal
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        {isInternal ? (
          <LockOpen className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {isInternal ? 'Admin Mode' : 'Public Mode'}
      </button>
    );
  }

  return (
    <Button
      variant={isInternal ? 'default' : 'outline'}
      onClick={toggle}
      className={
        isInternal
          ? 'bg-amber-500 text-white transition-colors duration-200 hover:bg-amber-600'
          : 'transition-colors duration-200'
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
