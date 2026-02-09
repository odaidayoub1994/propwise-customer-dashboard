"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-from" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateChange("from", e.target.value)}
          max={dateTo || undefined}
          className="w-full sm:w-40"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date-to" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateChange("to", e.target.value)}
          min={dateFrom || undefined}
          className="w-full sm:w-40"
        />
      </div>
      {(dateFrom || dateTo) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Clear dates
        </Button>
      )}
    </div>
  );
}
