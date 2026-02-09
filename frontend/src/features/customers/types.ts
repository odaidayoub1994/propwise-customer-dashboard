export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  national_id?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type { PaginatedResponse, BulkDeleteResponse } from '@/types/api';

export type SortColumn = 'created_at' | 'full_name';
export type SortOrder = 'ASC' | 'DESC';

export interface CustomerQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: SortColumn;
  sort_order?: SortOrder;
  date_from?: string;
  date_to?: string;
}

// Socket event payloads
export interface CustomerSocketPayload {
  id: string;
  full_name: string;
  email: string;
}

export interface CustomerDeletedPayload {
  id: string;
}

export interface BulkDeletedPayload {
  ids: string[];
}
