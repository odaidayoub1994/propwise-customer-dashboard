export interface CustomerEventPayload {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerDeletedPayload {
  id: string;
}

export interface CustomersBulkDeletedPayload {
  ids: string[];
}
