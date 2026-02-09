import type { Customer, CustomerQuery } from '@/features/customers/types';
import type { PaginatedResponse } from '@/types/api';

export const mockCustomer: Customer = {
  id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone_number: '+1234567890',
  national_id: '1234567890',
  internal_notes: 'VIP customer',
  created_at: '2024-06-15T10:30:00.000Z',
  updated_at: '2024-06-15T12:00:00.000Z',
};

export const mockCustomerPublic: Customer = {
  id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone_number: '+1234567890',
  created_at: '2024-06-15T10:30:00.000Z',
  updated_at: '2024-06-15T12:00:00.000Z',
};

export const mockPaginatedResponse: PaginatedResponse<Customer> = {
  data: [mockCustomer],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
};

export const defaultQuery: CustomerQuery = {
  page: 1,
  limit: 20,
  sort_by: 'created_at',
  sort_order: 'DESC',
};
