'use client';

import { Pagination as PaginationType } from '@/lib/types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages, total } = pagination;

  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Product pages">
      <button
        id="pagination-prev"
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ← PREV
      </button>

      <span className="page-indicator" aria-current="page">
        <span className="font-mono">{page}</span>
        <span className="text-muted"> / {pages}</span>
      </span>

      <button
        id="pagination-next"
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        NEXT →
      </button>

      <span className="page-total label">{total} ITEMS</span>
    </nav>
  );
}
