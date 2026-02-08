"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Trash2,
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
import { AdminToggle } from "@/components/AdminToggle";
import { Pagination } from "@/components/Pagination";
import { useAdminMode } from "@/context/AdminContext";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useCustomerFilters } from "@/features/customers/hooks/useCustomerFilters";
import { DEFAULT_LIMIT } from "@/features/customers/constants";
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
    handleSearchChange,
    handleDateChange,
    clearDateFilters,
    handleSort,
    handlePageChange,
  } = useCustomerFilters(clearSelection);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Data hooks
  const { data, isLoading, isError } = useCustomers({
    page,
    limit: DEFAULT_LIMIT,
    q: debouncedSearch || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });
  const deleteMutation = useDeleteCustomer();
  const bulkDeleteMutation = useBulkDeleteCustomers();

  const customers = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const isMutating = deleteMutation.isPending || bulkDeleteMutation.isPending;

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
          <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />
        );
      }
      return sortOrder === "ASC" ? (
        <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
      ) : (
        <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />
      );
    },
    [sortBy, sortOrder],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex items-center gap-3">
          <AdminToggle />
          <Button onClick={openCreateModal} disabled={isMutating}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={handleSearchChange} />

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
            className="w-40"
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
            className="w-40"
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
        <div className="flex items-center gap-3 rounded-md bg-muted p-3">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteModal(Array.from(selectedIds))}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="font-medium hover:underline"
                  onClick={() => handleSort("full_name")}
                >
                  Name{sortIcon("full_name")}
                </button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              {isInternal && <TableHead>National ID</TableHead>}
              {isInternal && <TableHead>Internal Notes</TableHead>}
              <TableHead>
                <button
                  type="button"
                  className="font-medium hover:underline"
                  onClick={() => handleSort("created_at")}
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
                  className="h-24 text-center text-destructive"
                >
                  Failed to load customers. Please try again later.
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isInternal ? 8 : 6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  data-state={
                    selectedIds.has(customer.id) ? "selected" : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(customer.id)}
                      onCheckedChange={() => toggleOne(customer.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.full_name}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone_number}</TableCell>
                  {isInternal && (
                    <TableCell>{customer.national_id ?? "—"}</TableCell>
                  )}
                  {isInternal && (
                    <TableCell className="max-w-50 truncate">
                      {customer.internal_notes ?? "—"}
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
        isPending={isMutating}
      />

      {/* Socket event listener */}
      <ToastNotifications />
    </div>
  );
}
