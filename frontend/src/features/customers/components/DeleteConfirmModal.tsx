'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isPending?: boolean;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  count,
  isPending = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 sm:mx-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle>
            Delete {count} customer{count !== 1 && 's'}?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The selected customer
            {count !== 1 ? 's' : ''} will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
