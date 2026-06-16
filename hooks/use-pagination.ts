"use client";

import * as React from "react";

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey?: string | number
) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  React.useEffect(() => {
    setPage(1);
  }, [items.length, pageSize, resetKey]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    page: safePage,
    setPage,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    rangeStart: items.length === 0 ? 0 : startIndex + 1,
    rangeEnd: Math.min(startIndex + pageSize, items.length),
    showPagination: items.length > pageSize,
  };
}
