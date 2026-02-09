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
        <TableCell colSpan={colSpan} className="h-48 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Failed to load customers</p>
              <p className="text-xs text-muted-foreground">
                Something went wrong. Please try again.
              </p>
            </div>
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
      <TableCell colSpan={colSpan} className="h-48 text-center">
        {hasActiveFilters ? (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-3">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground">
                No customers match your current filters.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No customers yet</p>
              <p className="text-xs text-muted-foreground">
                Get started by adding your first customer.
              </p>
            </div>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
