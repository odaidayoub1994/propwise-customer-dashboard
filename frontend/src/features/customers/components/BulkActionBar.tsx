"use client";

import { Trash2 } from "lucide-react";
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
    <div className="flex items-center gap-3 rounded-md bg-muted p-3 transition-all duration-200">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  );
}
