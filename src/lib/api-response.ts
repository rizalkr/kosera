/**
 * Standardized API response envelope utilities.
 * All API routes should return one of these shapes for consistency.
 */

export interface ApiSuccess<TData, TMeta = unknown> {
  success: true;
  message: string;
  data: TData;
  meta?: TMeta;
}

export interface ApiError<TDetails = unknown> {
  success: false;
  error: string; // short machine-readable error code or message
  message?: string; // optional human readable explanation
  details?: TDetails; // optional validation issues or extra context
}

export type ApiResponse<TData = unknown, TMeta = unknown, TDetails = unknown> =
  | ApiSuccess<TData, TMeta>
  | ApiError<TDetails>;

interface JsonInit extends ResponseInit {
  headers?: HeadersInit;
}

function buildHeaders(init?: JsonInit): HeadersInit {
  const base: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8' };
  if (init?.headers) {
    return { ...base, ...(init.headers as Record<string, string>) };
  }
  return base;
}

export function jsonSuccess<TData, TMeta = unknown>(
  data: TData,
  message = 'OK',
  init?: JsonInit & { meta?: TMeta }
): Response {
  const body: ApiSuccess<TData, TMeta> = {
    success: true,
    message,
    data,
    ...(init?.meta !== undefined ? { meta: init.meta } : {}),
  };
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    statusText: init?.statusText,
    headers: buildHeaders(init),
  });
}

export function jsonError<TDetails = unknown>(
  error: string,
  options?: {
    status?: number;
    message?: string;
    details?: TDetails;
    headers?: HeadersInit;
  }
): Response {
  const body: ApiError<TDetails> = {
    success: false,
    error,
    ...(options?.message ? { message: options.message } : {}),
    ...(options?.details !== undefined ? { details: options.details } : {}),
  };
  return new Response(JSON.stringify(body), {
    status: options?.status ?? 400,
    headers: buildHeaders({ headers: options?.headers }),
  });
}

/** Convenience helper selecting success or error variant */
export function json<TData, TMeta = unknown, TDetails = unknown>(
  response: ApiResponse<TData, TMeta, TDetails>,
  init?: JsonInit
): Response {
  return new Response(JSON.stringify(response), {
    status: init?.status ?? (response.success ? 200 : 400),
    headers: buildHeaders(init),
  });
}
