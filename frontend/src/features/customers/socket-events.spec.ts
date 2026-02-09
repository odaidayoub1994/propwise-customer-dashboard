import { SOCKET_EVENTS } from './socket-events';

describe('SOCKET_EVENTS', () => {
  it('defines all 4 customer socket event names', () => {
    expect(SOCKET_EVENTS).toEqual({
      CUSTOMER_CREATED: 'customer.created',
      CUSTOMER_UPDATED: 'customer.updated',
      CUSTOMER_DELETED: 'customer.deleted',
      CUSTOMERS_BULK_DELETED: 'customers.bulk_deleted',
    });
  });
});
