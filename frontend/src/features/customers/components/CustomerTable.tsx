'use client';

import { useCallback, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminToggle } from '@/components/AdminToggle';
import { Pagination } from '@/components/Pagination';
import { useAdminMode } from '@/context/AdminContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import {
  useDeleteCustomer,
  useBulkDeleteCustomers,
} from '@/features/customers/hooks/useCustomerMutations';
import { SearchBar } from '@/features/customers/components/SearchBar';
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal';
import { DeleteConfirmModal } from '@/features/customers/components/DeleteConfirmModal';
import { ToastNotifications } from '@/features/customers/components/ToastNotifications';
import type { Customer } from '@/features/customers/types';

export function CustomerTable() {
  const { isInternal } = useAdminMode();

  // Pagination & filtering state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<'created_at' | 'full_name'>(
    'created_at',
  );
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Data hooks
  const { data, isLoading } = useCustomers({
    page,
    limit: 20,
    q: debouncedSearch || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  const deleteMutation = useDeleteCustomer();
  const bulkDeleteMutation = useBulkDeleteCustomers();

  const customers = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const isMutating =
    deleteMutation.isPending || bulkDeleteMutation.isPending;

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

  // Search handler — reset page on new search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  // Sort handler
  const handleSort = useCallback(
    (column: 'created_at' | 'full_name') => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortBy(column);
        setSortOrder(column === 'full_name' ? 'ASC' : 'DESC');
      }
      setPage(1);
      setSelectedIds(new Set());
    },
    [sortBy],
  );

  // Page change — clear selection
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setSelectedIds(new Set());
  }, []);

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

  // Sort indicator
  const sortIndicator = useCallback(
    (column: 'created_at' | 'full_name') => {
      if (sortBy !== column) return '';
      return sortOrder === 'ASC' ? ' \u2191' : ' \u2193';
    },
    [sortBy, sortOrder],
  );

  // Format date for display
  const formatDate = useMemo(
    () => (dateStr: string) =>
      new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [],
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
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="font-medium hover:underline"
                  onClick={() => handleSort('full_name')}
                >
                  Name{sortIndicator('full_name')}
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
                  onClick={() => handleSort('created_at')}
                >
                  Created{sortIndicator('created_at')}
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
                    selectedIds.has(customer.id) ? 'selected' : undefined
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
                    <TableCell>{customer.national_id ?? '—'}</TableCell>
                  )}
                  {isInternal && (
                    <TableCell className="max-w-[200px] truncate">
                      {customer.internal_notes ?? '—'}
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
