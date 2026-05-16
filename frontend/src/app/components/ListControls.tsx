import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  label: string;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function getPageItems<T>(items: T[], page: number, pageSize: number) {
  const pageCount = getPageCount(items.length, pageSize);
  const safePage = clampPage(page, pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    pageItems: items.slice(start, start + pageSize),
    pageCount,
    safePage,
    startItem: items.length === 0 ? 0 : start + 1,
    endItem: Math.min(start + pageSize, items.length),
  };
}

export function PaginationControls({
  label,
  page,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const pageCount = getPageCount(totalItems, pageSize);
  const safePage = clampPage(page, pageCount);
  const pageNumbers = getCompactPageNumbers(safePage, pageCount);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-4 border-t border-walnut/10 bg-walnut/5 p-4 text-xs text-walnut/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="font-medium tabular-nums">
        Showing {startItem}-{endItem} of {totalItems} {label}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-xs font-medium text-walnut/55">
          Rows
          <select
            aria-label={`${label} per page`}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="min-h-11 rounded-lg border border-walnut/10 bg-parchment px-3 py-2 text-sm font-medium text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <nav aria-label={`${label} pagination`} className="flex flex-wrap items-center gap-1">
          <PageButton
            disabled={safePage === 1}
            label={`Previous ${label} page`}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </PageButton>

          {pageNumbers.map((item, index) => (
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="flex min-h-11 min-w-9 items-center justify-center text-walnut/35" aria-hidden="true">...</span>
            ) : (
              <PageButton
                key={item}
                active={item === safePage}
                label={`Go to ${label} page ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </PageButton>
            )
          ))}

          <PageButton
            disabled={safePage === pageCount}
            label={`Next ${label} page`}
            onClick={() => onPageChange(safePage + 1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </PageButton>
        </nav>
      </div>
    </div>
  );
}

type LoadMoreFooterProps = {
  label: string;
  totalItems: number;
  visibleItems: number;
  onLoadMore: () => void;
};

export function LoadMoreFooter({ label, totalItems, visibleItems, onLoadMore }: LoadMoreFooterProps) {
  const hasMore = visibleItems < totalItems;

  return (
    <div className="border-t border-walnut/10 bg-walnut/[0.03] p-4 text-center">
      <p className="mb-3 text-xs font-medium text-walnut/45">
        Showing {Math.min(visibleItems, totalItems)} of {totalItems} {label}
      </p>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="min-h-11 rounded-xl border border-walnut/15 bg-parchment px-5 text-sm font-medium text-walnut transition-colors hover:border-oxblood/30 hover:text-oxblood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20"
        >
          Show more {label}
        </button>
      )}
    </div>
  );
}

function PageButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/20 ${
        active
          ? "border border-oxblood/25 bg-oxblood text-parchment"
          : "border border-transparent text-walnut/60 hover:border-walnut/10 hover:bg-parchment hover:text-walnut"
      } disabled:pointer-events-none disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

function getPageCount(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 1), pageCount);
}

function getCompactPageNumbers(page: number, pageCount: number) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = Array.from(pages)
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((a, b) => a - b);

  return sorted.reduce<Array<number | "ellipsis">>((items, item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(item);
    return items;
  }, []);
}
