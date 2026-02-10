"use client";

import { CalendarDays, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-from" className="text-xs font-medium text-muted-foreground">
          From
        </Label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateChange("from", e.target.value)}
            max={dateTo || undefined}
            className="h-10 w-full cursor-pointer rounded-lg bg-card pl-9 shadow-sm sm:w-44"
          />
        </div>
      </div>
      <span className="mb-2.5 text-sm text-muted-foreground">–</span>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-to" className="text-xs font-medium text-muted-foreground">
          To
        </Label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onDateChange("to", e.target.value)}
            min={dateFrom || undefined}
            className="h-10 w-full cursor-pointer rounded-lg bg-card pl-9 shadow-sm sm:w-44"
          />
        </div>
      </div>
      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="mb-2.5 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear dates"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
