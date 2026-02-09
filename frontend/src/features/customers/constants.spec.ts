import {
  DEFAULT_QUERY,
  DEFAULT_SORT_BY,
  DEFAULT_LIMIT,
  MIN_SEARCH_LENGTH,
} from './constants';

describe('customer constants', () => {
  it('DEFAULT_QUERY has correct shape', () => {
    expect(DEFAULT_QUERY).toEqual({
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'DESC',
    });
  });

  it('DEFAULT_SORT_BY is created_at', () => {
    expect(DEFAULT_SORT_BY).toBe('created_at');
  });

  it('MIN_SEARCH_LENGTH is 3 and DEFAULT_LIMIT is 20', () => {
    expect(MIN_SEARCH_LENGTH).toBe(3);
    expect(DEFAULT_LIMIT).toBe(20);
  });
});
