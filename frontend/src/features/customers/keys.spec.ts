import { customerKeys } from './keys';

describe('customerKeys', () => {
  it('.all returns ["customers"]', () => {
    expect(customerKeys.all).toEqual(['customers']);
  });

  it('.list(params) includes query and isInternal', () => {
    const params = { page: 1, limit: 20, isInternal: true };
    const key = customerKeys.list(params);
    expect(key).toEqual(['customers', 'list', params]);
  });
});
