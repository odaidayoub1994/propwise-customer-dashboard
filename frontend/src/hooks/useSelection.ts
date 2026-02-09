'use client';

import { useCallback } from 'react';

interface UseSelectionReturn {
  allSelected: boolean;
  toggleOne: (id: string) => void;
  toggleAll: () => void;
}

export function useSelection(
  items: { id: string }[],
  selectedIds: Set<string>,
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>,
): UseSelectionReturn {
  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.has(item.id));

  const toggleOne = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [setSelectedIds],
  );

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allCurrentlySelected = items.every((item) => prev.has(item.id));
      if (allCurrentlySelected) return new Set();
      return new Set(items.map((item) => item.id));
    });
  }, [items, setSelectedIds]);

  return { allSelected, toggleOne, toggleAll };
}
