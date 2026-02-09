'use client';

import { Users } from 'lucide-react';

interface StatsCardsProps {
  total: number | undefined;
}

export function StatsCards({ total }: StatsCardsProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2.5 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {total ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Total Customers</p>
        </div>
      </div>
    </div>
  );
}
