'use client';

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';

interface AdminContextValue {
  isInternal: boolean;
  toggle: () => void;
}

const STORAGE_KEY = 'propwise-admin-mode';

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function getServerSnapshot(): boolean {
  return false;
}

function setStoredValue(value: boolean) {
  localStorage.setItem(STORAGE_KEY, String(value));
  listeners.forEach((cb) => cb());
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const isInternal = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    setStoredValue(!getSnapshot());
  }, []);

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
