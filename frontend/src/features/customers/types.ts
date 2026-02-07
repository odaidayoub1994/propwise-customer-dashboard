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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: 'created_at' | 'full_name';
  sort_order?: 'ASC' | 'DESC';
  date_from?: string;
  date_to?: string;
}
