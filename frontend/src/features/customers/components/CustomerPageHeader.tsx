"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerPageHeaderProps {
  onAddCustomer: () => void;
}

export function CustomerPageHeader({
  onAddCustomer,
}: CustomerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Manage your customer records
        </p>
      </div>
      <Button onClick={onAddCustomer}>
        <Plus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>
    </div>
  );
}
