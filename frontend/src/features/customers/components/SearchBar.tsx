'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

export function SearchBar({ value, onChange, hint }: SearchBarProps) {
  return (
    <search role="search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-lg bg-card pl-10 pr-10 shadow-sm"
          aria-label="Search customers"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </search>
  );
}
