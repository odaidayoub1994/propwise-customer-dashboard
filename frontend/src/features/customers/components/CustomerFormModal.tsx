'use client';

import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAdminMode } from '@/context/AdminContext';
import {
  useCreateCustomer,
  useUpdateCustomer,
} from '@/features/customers/hooks/useCustomerMutations';
import type { Customer } from '@/features/customers/types';

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

function CustomerForm({
  customer,
  onClose,
}: {
  customer?: Customer | null;
  onClose: () => void;
}) {
  const { isInternal } = useAdminMode();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isEditing = !!customer;

  const [fullName, setFullName] = useState(customer?.full_name ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone_number ?? '');
  const [nationalId, setNationalId] = useState(customer?.national_id ?? '');
  const [internalNotes, setInternalNotes] = useState(
    customer?.internal_notes ?? '',
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: Partial<Customer> = {
      full_name: fullName,
      email,
      phone_number: phoneNumber,
      ...(isInternal && {
        national_id: nationalId || null,
        internal_notes: internalNotes || null,
      }),
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: customer.id, data },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(data, { onSuccess: onClose });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone_number">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone_number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+962791234567"
            required
          />
        </div>
      </div>

      {isInternal && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Admin-only fields</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CustomerFormModal({
  open,
  onClose,
  customer,
}: CustomerFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Edit Customer' : 'Add Customer'}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? 'Update the customer details below.'
              : 'Fill in the details to create a new customer.'}
          </DialogDescription>
        </DialogHeader>
        {/* key forces remount so form state resets on open */}
        <CustomerForm
          key={customer?.id ?? 'new'}
          customer={customer}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
