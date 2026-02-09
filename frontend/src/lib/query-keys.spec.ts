import { createEntityKeys } from './query-keys';

interface TestQuery {
  page?: number;
  q?: string;
}

const keys = createEntityKeys<TestQuery>('items');

describe('createEntityKeys', () => {
  it('.all returns entity tuple', () => {
    expect(keys.all).toEqual(['items']);
  });

  it('.lists() appends "list"', () => {
    expect(keys.lists()).toEqual(['items', 'list']);
  });

  it('.list(params) appends params object', () => {
    const params = { page: 1, q: 'test', isInternal: false };
    expect(keys.list(params)).toEqual(['items', 'list', params]);
  });

  it('.details() appends "detail"', () => {
    expect(keys.details()).toEqual(['items', 'detail']);
  });

  it('.detail(id, true) includes isInternal flag', () => {
    expect(keys.detail('abc', true)).toEqual([
      'items',
      'detail',
      'abc',
      { isInternal: true },
    ]);
  });

  it('.detail(id, false) includes isInternal: false', () => {
    expect(keys.detail('abc', false)).toEqual([
      'items',
      'detail',
      'abc',
      { isInternal: false },
    ]);
  });
});
