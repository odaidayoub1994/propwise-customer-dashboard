'use client';

import { CalendarDays, UserPlus, Users } from 'lucide-react';
import { useCustomerStats } from '@/features/customers/hooks/useCustomerStats';

interface StatsCardsProps {
  total: number | undefined;
}

const CARDS = [
  { key: 'total', label: 'Total Customers', icon: Users, color: 'text-primary' },
  { key: 'thisWeek', label: 'Added This Week', icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'thisMonth', label: 'Added This Month', icon: CalendarDays, color: 'text-blue-600 dark:text-blue-400' },
] as const;

export function StatsCards({ total }: StatsCardsProps) {
  const stats = useCustomerStats(total);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CARDS.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-muted p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stats.isLoading && key !== 'total' ? (
                  <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" />
                ) : (
                  stats[key]
                )}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
