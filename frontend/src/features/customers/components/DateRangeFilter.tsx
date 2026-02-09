"use client";

import { CalendarDays, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateChange: (field: "from" | "to", value: string) => void;
  onClear: () => void;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateChange,
  onClear,
}: DateRangeFilterProps) {
  const hasValue = dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateChange("from", e.target.value)}
          max={dateTo || undefined}
          className="h-10 w-full rounded-lg bg-card pl-9 shadow-sm sm:w-44"
          aria-label="From date"
        />
      </div>
      <span className="text-sm text-muted-foreground">–</span>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateChange("to", e.target.value)}
          min={dateFrom || undefined}
          className="h-10 w-full rounded-lg bg-card pl-9 shadow-sm sm:w-44"
          aria-label="To date"
        />
      </div>
      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear dates"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
