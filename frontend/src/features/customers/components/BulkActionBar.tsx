"use client";

import { CheckSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  isPending: boolean;
}

export function BulkActionBar({
  selectedCount,
  onDelete,
  isPending,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <CheckSquare className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">
        {selectedCount} customer{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isPending}
        className="ml-auto"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  );
}
