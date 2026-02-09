"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useSelection } from "@/hooks/useSelection";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CustomerPageHeader } from "@/features/customers/components/CustomerPageHeader";
import { DateRangeFilter } from "@/features/customers/components/DateRangeFilter";
import { BulkActionBar } from "@/features/customers/components/BulkActionBar";
import { CustomerRow } from "@/features/customers/components/CustomerRow";
import { CustomerTableEmpty } from "@/features/customers/components/CustomerTableEmpty";
import type { Customer, SortColumn } from "@/features/customers/types";

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
  const colSpan = isInternal ? 8 : 6;

  const { allSelected, toggleOne, toggleAll } = useSelection(
    customers,
    selectedIds,
    setSelectedIds,
  );

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
    if (deletingIds.length === 0) return;
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

  const showRows = !isLoading && !isError && customers.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <CustomerPageHeader onAddCustomer={openCreateModal} />
      <SearchBar value={search} onChange={handleSearchChange} hint={searchHint} />
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={handleDateChange}
        onClear={clearDateFilters}
      />
      <BulkActionBar
        selectedCount={selectedIds.size}
        onDelete={() => openDeleteModal(Array.from(selectedIds))}
        isPending={bulkDeleteMutation.isPending}
      />

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
                  Created At{sortIcon("created_at")}
                </button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showRows ? (
              customers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedIds.has(customer.id)}
                  isInternal={isInternal}
                  onToggleSelect={toggleOne}
                  onEdit={openEditModal}
                  onDelete={(id) => openDeleteModal([id])}
                />
              ))
            ) : (
              <CustomerTableEmpty
                isLoading={isLoading}
                isError={isError}
                hasActiveFilters={hasActiveFilters}
                colSpan={colSpan}
                onRetry={() => refetch()}
                onClearFilters={clearAllFilters}
              />
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}

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

      <ToastNotifications />
    </div>
  );
}
