export type MetaPage = {
  totalItems: number;
  totalPages: number;
  page: number;
  offset: number;
  endOffset: number;
  limit: number;
};

export type PageFilters = {
  search?: string;
  page?: number;
  limit?: number;
  // orderBy?: string;
  // sort?: string;
};

export const LIMIT_OFFSET = 15;
