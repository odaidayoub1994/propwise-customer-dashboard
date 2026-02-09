"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminToggle } from "@/components/AdminToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

interface CustomerPageHeaderProps {
  onAddCustomer: () => void;
}

export function CustomerPageHeader({
  onAddCustomer,
}: CustomerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <AdminToggle />
        <Button onClick={onAddCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
    </div>
  );
}
