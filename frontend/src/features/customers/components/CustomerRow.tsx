"use client";

import { memo } from "react";
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

interface CustomerRowProps {
  customer: Customer;
  isSelected: boolean;
  isInternal: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerRow = memo(function CustomerRow({
  customer,
  isSelected,
  isInternal,
  onToggleSelect,
  onEdit,
  onDelete,
}: CustomerRowProps) {
  return (
    <TableRow
      data-state={isSelected ? "selected" : undefined}
      className={`transition-colors duration-150${isSelected ? " bg-muted/50" : ""}`}
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(customer.id)}
          aria-label={`Select ${customer.full_name}`}
        />
      </TableCell>
      <TableCell className="min-w-0 font-medium">
        {customer.full_name}
      </TableCell>
      <TableCell className="min-w-0">{customer.email}</TableCell>
      <TableCell className="hidden md:table-cell">
        {customer.phone_number}
      </TableCell>
      {isInternal && (
        <TableCell className="hidden md:table-cell">
          {customer.national_id ?? "—"}
        </TableCell>
      )}
      {isInternal && (
        <TableCell className="hidden max-w-xs md:table-cell">
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
      <TableCell>{formatDate(customer.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(customer)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(customer.id)}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
