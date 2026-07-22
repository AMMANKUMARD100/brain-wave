export function formatResponse<T>({ data, message = 'Request completed successfully' }: { data: T; message?: string }) {
  return {
    success: true,
    message,
    data,
  };
}
