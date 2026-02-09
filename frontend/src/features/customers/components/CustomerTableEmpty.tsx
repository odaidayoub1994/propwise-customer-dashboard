"use client";

import { AlertCircle, SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

interface CustomerTableEmptyProps {
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  colSpan: number;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function CustomerTableEmpty({
  isLoading,
  isError,
  hasActiveFilters,
  colSpan,
  onRetry,
  onClearFilters,
}: CustomerTableEmptyProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: colSpan }).map((__, j) => (
              <TableCell key={j}>
                <div className="h-4 animate-pulse rounded bg-muted" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-32 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load customers.
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        {hasActiveFilters ? (
          <div className="flex flex-col items-center gap-2">
            <SearchX className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No customers match your filters.
            </p>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No customers yet. Click &quot;Add Customer&quot; to get started.
            </p>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
