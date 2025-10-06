export interface ApiResponse<T> {
  data: T;
  message?: string;
  warning?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
