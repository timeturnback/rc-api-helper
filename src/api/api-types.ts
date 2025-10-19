export interface MetaResponse<T> {
  data: T;
  request_id: string;
}

export interface SuccessResponse {
  success: boolean;
}
