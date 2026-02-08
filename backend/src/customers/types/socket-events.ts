export interface CustomerEventPayload {
  id: string;
  full_name: string;
  email: string;
}

export interface CustomerDeletedPayload {
  id: string;
}

export interface CustomersBulkDeletedPayload {
  ids: string[];
}
