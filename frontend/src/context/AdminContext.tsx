'use client';

import { createContext, useCallback, useContext, useState } from 'react';

interface AdminContextValue {
  isInternal: boolean;
  toggle: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isInternal, setIsInternal] = useState(false);
  const toggle = useCallback(() => setIsInternal((prev) => !prev), []);

  return (
    <AdminContext value={{ isInternal, toggle }}>
      {children}
    </AdminContext>
  );
}

export function useAdminMode(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminMode must be used within an AdminProvider');
  }
  return context;
}
