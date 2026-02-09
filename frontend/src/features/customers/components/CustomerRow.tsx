"use client";

import { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { Customer } from "@/features/customers/types";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface CustomerRowProps {
  customer: Customer;
  index: number;
  isSelected: boolean;
  isInternal: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerRow = memo(function CustomerRow({
  customer,
  index,
  isSelected,
  isInternal,
  onToggleSelect,
  onEdit,
  onDelete,
}: CustomerRowProps) {
  const stripe = index % 2 === 1 ? " bg-muted/30" : "";
  const rowBg = isSelected ? " bg-primary/5" : stripe;

  return (
    <TableRow
      data-state={isSelected ? "selected" : undefined}
      className={`transition-colors duration-150${rowBg}`}
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(customer.id)}
          aria-label={`Select ${customer.full_name}`}
        />
      </TableCell>
      <TableCell className="min-w-0">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(customer.full_name)}`}
          >
            {getInitials(customer.full_name)}
          </div>
          <span className="font-medium">{customer.full_name}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-0 text-muted-foreground">
        {customer.email}
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {customer.phone_number}
      </TableCell>
      {isInternal && (
        <TableCell className="hidden text-muted-foreground md:table-cell">
          {customer.national_id ?? "—"}
        </TableCell>
      )}
      {isInternal && (
        <TableCell className="hidden max-w-xs text-muted-foreground md:table-cell">
          {customer.internal_notes ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block truncate">
                  {customer.internal_notes}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                {customer.internal_notes}
              </TooltipContent>
            </Tooltip>
          ) : (
            "—"
          )}
        </TableCell>
      )}
      <TableCell className="text-muted-foreground">
        {formatDate(customer.created_at)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(customer)}
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(customer.id)}
                className="hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
});
