'use client';

import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AdminToggle } from '@/components/AdminToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConnectionStatus } from '@/components/ConnectionStatus';

import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '#', icon: LayoutDashboard, disabled: true },
  { label: 'Customers', href: '/', icon: Users },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Propwise</span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : item.disabled
                    ? 'cursor-not-allowed text-muted-foreground/50'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.disabled && (
                <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom controls */}
      <div className="space-y-2 px-3 py-4">
        <AdminToggle variant="sidebar" />
        <ThemeToggle variant="sidebar" />
        <ConnectionStatus />
      </div>
    </div>
  );
}
