export interface HttpExceptionResponse {
  error: {
    status: number;
    message: string | undefined;
    requestId: string;
  };
}
