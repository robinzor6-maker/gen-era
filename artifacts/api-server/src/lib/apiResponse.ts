export const successResponse = (data: unknown, message = "Success") => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, details?: unknown) => ({
  success: false,
  message,
  details,
});
