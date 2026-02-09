export function createEntityKeys<TQuery>(entity: string) {
  const all = [entity] as const;
  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (params: TQuery & { isInternal: boolean }) =>
      [...all, 'list', params] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: string, isInternal: boolean) =>
      [...all, 'detail', id, { isInternal }] as const,
  };
}
