/**
 * Pagination utilities to standardize page/limit parsing and metadata building.
 */
export interface ParsedPaginationQuery {
  page: number;
  limit: number;
  offset: number;
}

export interface BuildPaginationMetaArgs {
  page: number;
  limit: number;
  total: number;
}

export function parsePagination(searchParams: URLSearchParams, defaults: { page?: number; limit?: number } = {}): ParsedPaginationQuery {
  const pageRaw = searchParams.get('page');
  const limitRaw = searchParams.get('limit');
  const page = Math.max(1, parseInt(pageRaw || String(defaults.page || 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitRaw || String(defaults.limit || 10), 10) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

export function buildPaginationMeta({ page, limit, total }: BuildPaginationMetaArgs) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
