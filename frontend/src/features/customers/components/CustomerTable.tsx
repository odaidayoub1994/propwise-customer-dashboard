"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  SearchX,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminToggle } from "@/components/AdminToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/Pagination";
import { useAdminMode } from "@/context/AdminContext";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useCustomerFilters } from "@/features/customers/hooks/useCustomerFilters";
import { DEFAULT_LIMIT, MIN_SEARCH_LENGTH } from "@/features/customers/constants";
import {
  useDeleteCustomer,
  useBulkDeleteCustomers,
} from "@/features/customers/hooks/useCustomerMutations";
import { SearchBar } from "@/features/customers/components/SearchBar";
import { CustomerFormModal } from "@/features/customers/components/CustomerFormModal";
import { DeleteConfirmModal } from "@/features/customers/components/DeleteConfirmModal";
import { ToastNotifications } from "@/features/customers/components/ToastNotifications";
import type { Customer, SortColumn } from "@/features/customers/types";

// Format date for display
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerTable() {
  const { isInternal } = useAdminMode();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Filter/sort/pagination state
  const {
    page,
    search,
    debouncedSearch,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    hasActiveFilters,
    handleSearchChange,
    handleDateChange,
    clearDateFilters,
    handleSort,
    handlePageChange,
    clearAllFilters,
  } = useCustomerFilters(clearSelection);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const trimmedSearch = debouncedSearch.trim();
  const searchHint =
    trimmedSearch.length > 0 && trimmedSearch.length < MIN_SEARCH_LENGTH
      ? `Type ${MIN_SEARCH_LENGTH - trimmedSearch.length} more character${MIN_SEARCH_LENGTH - trimmedSearch.length === 1 ? "" : "s"} to search…`
      : undefined;

  // Data hooks
  const { data, isLoading, isError, refetch } = useCustomers({
    page,
    limit: DEFAULT_LIMIT,
    q: trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });
  const deleteMutation = useDeleteCustomer();
  const bulkDeleteMutation = useBulkDeleteCustomers();

  const customers = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  // Selection helpers
  const allSelected =
    customers.length > 0 && customers.every((c) => selectedIds.has(c.id));

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allCurrentlySelected = customers.every((c) => prev.has(c.id));
      if (allCurrentlySelected) return new Set();
      return new Set(customers.map((c) => c.id));
    });
  }, [customers]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  }, []);

  const openEditModal = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  }, []);

  const openDeleteModal = useCallback((ids: string[]) => {
    setDeletingIds(ids);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingIds([]);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingIds.length === 1) {
      deleteMutation.mutate(deletingIds[0], {
        onSuccess: () => {
          setSelectedIds(new Set());
          closeDeleteModal();
        },
      });
    } else {
      bulkDeleteMutation.mutate(deletingIds, {
        onSuccess: () => {
          setSelectedIds(new Set());
          closeDeleteModal();
        },
      });
    }
  }, [deletingIds, deleteMutation, bulkDeleteMutation, closeDeleteModal]);

  // Sort icon — shows direction on active column, ↕ on inactive
  const sortIcon = useCallback(
    (column: SortColumn) => {
      if (sortBy !== column) {
        return (
          <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground" />
        );
      }
      return sortOrder === "ASC" ? (
        <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
      ) : (
        <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
      );
    },
    [sortBy, sortOrder],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AdminToggle />
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={handleSearchChange} hint={searchHint} />

      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date-from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateChange("from", e.target.value)}
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
            onChange={(e) => handleDateChange("to", e.target.value)}
            min={dateFrom || undefined}
            className="w-full sm:w-40"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear dates
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md bg-muted p-3 transition-all duration-200">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteModal(Array.from(selectedIds))}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all customers"
                />
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="cursor-pointer font-medium transition-colors hover:underline"
                  onClick={() => handleSort("full_name")}
                  aria-label={`Sort by name${sortBy === "full_name" ? `, currently ${sortOrder === "ASC" ? "ascending" : "descending"}` : ""}`}
                >
                  Name{sortIcon("full_name")}
                </button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              {isInternal && (
                <TableHead className="hidden md:table-cell">
                  National ID
                </TableHead>
              )}
              {isInternal && (
                <TableHead className="hidden md:table-cell">
                  Internal Notes
                </TableHead>
              )}
              <TableHead>
                <button
                  type="button"
                  className="cursor-pointer font-medium transition-colors hover:underline"
                  onClick={() => handleSort("created_at")}
                  aria-label={`Sort by created date${sortBy === "created_at" ? `, currently ${sortOrder === "ASC" ? "ascending" : "descending"}` : ""}`}
                >
                  Created{sortIcon("created_at")}
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({
                    length: isInternal ? 8 : 6,
                  }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={isInternal ? 8 : 6}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm text-destructive">
                      Failed to load customers.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isInternal ? 8 : 6}
                  className="h-32 text-center"
                >
                  {hasActiveFilters ? (
                    <div className="flex flex-col items-center gap-2">
                      <SearchX className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No customers match your filters.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No customers yet. Click &quot;Add Customer&quot; to get
                        started.
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  data-state={
                    selectedIds.has(customer.id) ? "selected" : undefined
                  }
                  className={`transition-colors duration-150${selectedIds.has(customer.id) ? " bg-muted/50" : ""}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(customer.id)}
                      onCheckedChange={() => toggleOne(customer.id)}
                      aria-label={`Select ${customer.full_name}`}
                    />
                  </TableCell>
                  <TableCell className="min-w-0 font-medium">
                    {customer.full_name}
                  </TableCell>
                  <TableCell className="min-w-0">
                    {customer.email}
                  </TableCell>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditModal(customer)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => openDeleteModal([customer.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <CustomerFormModal
        open={isFormOpen}
        onClose={closeFormModal}
        customer={editingCustomer}
      />
      <DeleteConfirmModal
        open={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        count={deletingIds.length}
        isPending={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />

      {/* Socket event listener */}
      <ToastNotifications />
    </div>
  );
}
