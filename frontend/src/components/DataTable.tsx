import { useEffect, useRef, useState } from "react";

import Icon from "./Icon";

type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  widthClass?: string;
  align?: "left" | "center" | "right";
  pin?: "left" | "right";
  resizable?: boolean;
  widthPx?: number;
  minWidthPx?: number;
  maxWidthPx?: number;
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  hiddenColumns?: Array<keyof T>;
  columnOrder?: Array<keyof T>;
  emptySlot?: React.ReactNode;
  rowDensity?: "comfortable" | "compact";
  persistKey?: string;
  resetKey?: string | number;
  autoFitOnDoubleClick?: boolean;
  autoFitAnnounce?: boolean;
  autoFitResetOnDoubleClick?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;
  renderRowActions?: (row: T) => React.ReactNode;
  showActionsOnHover?: boolean;
  stickyHeader?: boolean;
  maxHeightClass?: string;
  onRowClick?: (row: T) => void;
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: keyof T, direction: "asc" | "desc") => void;
  emptyMessage?: string;
};

export default function DataTable<T extends Record<string, string | number>>({
  columns,
  rows,
  hiddenColumns = [],
  columnOrder,
  emptySlot,
  rowDensity = "comfortable",
  persistKey,
  resetKey,
  autoFitOnDoubleClick = true,
  autoFitAnnounce = false,
  autoFitResetOnDoubleClick = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  renderRowActions,
  showActionsOnHover = false,
  stickyHeader = false,
  maxHeightClass = "max-h-64",
  onRowClick,
  sortKey,
  sortDirection = "asc",
  onSortChange,
  emptyMessage = "표시할 데이터가 없습니다.",
}: DataTableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
    minWidth: number;
    maxWidth: number;
  } | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [autoFitAnnouncement, setAutoFitAnnouncement] = useState("");
  useEffect(() => {
    if (!persistKey || typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(persistKey);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as Record<string, number>;
      setColumnWidths(parsed);
    } catch {
      // ignore invalid storage
    }
  }, [persistKey]);

  useEffect(() => {
    if (!persistKey || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(persistKey, JSON.stringify(columnWidths));
  }, [columnWidths, persistKey]);

  useEffect(() => {
    if (resetKey === undefined) {
      return;
    }
    setColumnWidths({});
    if (persistKey && typeof window !== "undefined") {
      window.localStorage.removeItem(persistKey);
    }
  }, [persistKey, resetKey]);
  const resolveRowId = (row: T, index: number) =>
    getRowId ? getRowId(row) : `${index}`;
  const orderedColumns = columnOrder?.length
    ? [
        ...columnOrder
          .map((key) => columns.find((column) => column.key === key))
          .filter((column): column is TableColumn<T> => Boolean(column)),
        ...columns.filter((column) => !columnOrder.includes(column.key)),
      ]
    : columns;
  const visibleColumns = orderedColumns.filter((column) => !hiddenColumns.includes(column.key));

  const allSelected =
    selectable &&
    rows.length > 0 &&
    rows.every((row, index) => selectedIds.includes(resolveRowId(row, index)));

  const toggleAll = () => {
    if (!onSelectionChange) {
      return;
    }
    if (allSelected) {
      onSelectionChange([]);
      return;
    }
    const ids = rows.map((row, index) => resolveRowId(row, index));
    onSelectionChange(ids);
  };

  const toggleRow = (row: T, index: number) => {
    if (!onSelectionChange) {
      return;
    }
    const id = resolveRowId(row, index);
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id],
    );
  };

  const handleSort = (key: keyof T) => {
    if (!onSortChange) {
      return;
    }
    const nextDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(key, nextDirection);
  };

  const isCompact = rowDensity === "compact";
  const cellPadding = isCompact ? "px-3 py-1" : "px-4 py-2";
  const cellText = isCompact ? "text-xs" : "text-sm";
  const emptyPadding = isCompact ? "px-3 py-4" : "px-4 py-6";
  const getPinnedHeaderClass = (pin?: "left" | "right") =>
    pin === "left"
      ? "sticky left-0 z-10 bg-neutral-50 dark:bg-neutral-800"
      : pin === "right"
      ? "sticky right-0 z-10 bg-neutral-50 dark:bg-neutral-800"
      : "";
  const getPinnedCellClass = (pin?: "left" | "right") =>
    pin === "left"
      ? "sticky left-0 z-10 bg-white dark:bg-neutral-900 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800"
      : pin === "right"
      ? "sticky right-0 z-10 bg-white dark:bg-neutral-900 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800"
      : "";
  const getColumnStyle = (column: TableColumn<T>) => {
    const key = String(column.key);
    const width = columnWidths[key] ?? column.widthPx;
    return {
      width,
      minWidth: column.minWidthPx,
      maxWidth: column.maxWidthPx,
    } as const;
  };
  const getSortAria = (key: keyof T, sortable?: boolean) => {
    if (!onSortChange || !sortable) {
      return undefined;
    }
    if (sortKey !== key) {
      return "none" as const;
    }
    return sortDirection === "asc" ? ("ascending" as const) : ("descending" as const);
  };
  const getResizeState = (column: TableColumn<T>) => {
    const key = String(column.key);
    const current = columnWidths[key] ?? column.widthPx;
    if (current === undefined) {
      return null;
    }
    const minWidth = column.minWidthPx ?? 80;
    const maxWidth = column.maxWidthPx ?? 480;
    if (current <= minWidth + 1) {
      return "min";
    }
    if (current >= maxWidth - 1) {
      return "max";
    }
    return null;
  };
  const handleAutoFit = (column: TableColumn<T>, columnIndex: number) => {
    if (!autoFitOnDoubleClick || !tableRef.current) {
      return;
    }
    const offset = selectable ? 1 : 0;
    const nth = columnIndex + 1 + offset;
    const cells = tableRef.current.querySelectorAll(`tr > :nth-child(${nth})`);
    let maxWidth = 0;
    cells.forEach((cell) => {
      const el = cell as HTMLElement;
      maxWidth = Math.max(maxWidth, el.scrollWidth);
    });
    const minWidth = column.minWidthPx ?? 80;
    const maxWidthPx = column.maxWidthPx ?? 480;
    const next = Math.min(maxWidthPx, Math.max(minWidth, maxWidth + 16));
    setColumnWidths((prev) => ({
      ...prev,
      [String(column.key)]: next,
    }));
    if (autoFitAnnounce) {
      setAutoFitAnnouncement(`${String(column.label)} 열 너비가 자동으로 조정되었습니다.`);
      window.setTimeout(() => setAutoFitAnnouncement(""), 1500);
    }
  };
  const handleAutoFitReset = (column: TableColumn<T>, columnIndex: number) => {
    if (!autoFitResetOnDoubleClick) {
      handleAutoFit(column, columnIndex);
      return;
    }
    const key = String(column.key);
    if (columnWidths[key] !== undefined) {
      setColumnWidths((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      if (autoFitAnnounce) {
        setAutoFitAnnouncement(`${String(column.label)} 열 너비가 초기값으로 복원되었습니다.`);
        window.setTimeout(() => setAutoFitAnnouncement(""), 1500);
      }
      return;
    }
    handleAutoFit(column, columnIndex);
  };
  const handleResizeStart = (
    event: React.MouseEvent<HTMLDivElement>,
    column: TableColumn<T>,
  ) => {
    if (!column.resizable) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const headerCell = event.currentTarget.parentElement;
    const startWidth = headerCell?.getBoundingClientRect().width ?? column.widthPx ?? 160;
    resizeRef.current = {
      key: String(column.key),
      startX: event.clientX,
      startWidth,
      minWidth: column.minWidthPx ?? 80,
      maxWidth: column.maxWidthPx ?? 480,
    };
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current) {
        return;
      }
      const delta = moveEvent.clientX - resizeRef.current.startX;
      const next = Math.min(
        resizeRef.current.maxWidth,
        Math.max(resizeRef.current.minWidth, resizeRef.current.startWidth + delta),
      );
      setColumnWidths((prev) => ({
        ...prev,
        [resizeRef.current!.key]: next,
      }));
    };
    const handleMouseUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`rounded-lg border border-neutral-200 dark:border-neutral-700 ${
        stickyHeader ? `overflow-auto ${maxHeightClass}` : "overflow-hidden"
      }`}
    >
      {autoFitAnnounce ? (
        <span className="sr-only" aria-live="polite">
          {autoFitAnnouncement}
        </span>
      ) : null}
      <table ref={tableRef} className="w-full text-left text-sm">
        <thead
          className={`bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 ${
            stickyHeader ? "sticky top-0 z-10" : ""
          }`}
        >
          <tr>
            {selectable ? (
              <th className={`w-10 ${cellPadding}`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="전체 선택"
                />
              </th>
            ) : null}
            {visibleColumns.map((column, columnIndex) => (
              <th
                key={String(column.key)}
                aria-sort={getSortAria(column.key, column.sortable)}
                style={getColumnStyle(column)}
                className={`${cellPadding} ${cellText} relative ${getPinnedHeaderClass(
                  column.pin,
                )} font-semibold ${column.widthClass ?? ""} ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {onSortChange ? (
                  column.sortable ? (
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 ${
                        column.align === "center"
                          ? "justify-center"
                          : column.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                      onClick={() => handleSort(column.key)}
                      aria-label={`${column.label} 정렬`}
                    >
                      <span>{column.label}</span>
                      <Icon
                        symbol={
                          sortKey === column.key
                            ? sortDirection === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"
                        }
                        size="sm"
                        className={
                          sortKey === column.key
                            ? "bg-primary-500/10 text-primary-500"
                            : "bg-transparent text-neutral-400"
                        }
                      />
                    </button>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-2 text-neutral-400 ${
                        column.align === "center"
                          ? "justify-center"
                          : column.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span>{column.label}</span>
                      <Icon symbol="↕" size="sm" className="bg-transparent text-neutral-300" />
                    </span>
                  )
                ) : (
                  column.label
                )}
                {column.resizable ? (
                  <div
                    className={`group absolute right-0 top-0 h-full w-1 cursor-col-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 ${
                      getResizeState(column) === "min"
                        ? "bg-primary-500/30"
                        : getResizeState(column) === "max"
                        ? "bg-secondary-500/30"
                        : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                    onMouseDown={(event) => handleResizeStart(event, column)}
                    role="separator"
                    tabIndex={0}
                    aria-label={`${column.label} 열 너비 조절`}
                    aria-orientation="vertical"
                    onKeyDown={(event) => {
                      const step = event.shiftKey ? 20 : 8;
                      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                        return;
                      }
                      event.preventDefault();
                      const key = String(column.key);
                      const current = columnWidths[key] ?? column.widthPx ?? 160;
                      const minWidth = column.minWidthPx ?? 80;
                      const maxWidth = column.maxWidthPx ?? 480;
                      const delta = event.key === "ArrowLeft" ? -step : step;
                      const next = Math.min(maxWidth, Math.max(minWidth, current + delta));
                      setColumnWidths((prev) => ({
                        ...prev,
                        [key]: next,
                      }));
                    }}
                    onDoubleClick={() => handleAutoFitReset(column, columnIndex)}
                    title={
                      getResizeState(column) === "min"
                        ? "최소 너비"
                        : getResizeState(column) === "max"
                        ? "최대 너비"
                        : "드래그하거나 화살표 키로 조절 (Shift+←/→: 20px)"
                    }
                  >
                    <span className="sr-only">
                      드래그하거나 좌우 화살표 키로 너비 조절, Shift+좌우 화살표로 더 크게 조절
                    </span>
                    <span className="pointer-events-none absolute -top-6 right-2 hidden rounded bg-neutral-900 px-2 py-1 text-[10px] text-white group-hover:block">
                      {getResizeState(column) === "min"
                        ? "최소 너비"
                        : getResizeState(column) === "max"
                        ? "최대 너비"
                        : "드래그/←→, Shift+←→"}
                    </span>
                  </div>
                ) : null}
              </th>
            ))}
            {renderRowActions ? (
              <th className={`${cellPadding} ${cellText} text-right font-semibold`}>Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-neutral-100 dark:border-neutral-700">
              <td
                colSpan={visibleColumns.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0)}
                className={`${emptyPadding} text-center text-neutral-500 dark:text-neutral-400`}
              >
                {emptySlot ?? emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rowId = resolveRowId(row, index);
              const isSelected = selectedIds.includes(rowId);
              const rowBgClass = isSelected ? "bg-primary-500/10 dark:bg-primary-500/20" : "";
              return (
                <tr
                  key={index}
                  className={`group border-t border-neutral-100 transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 ${
                    rowBgClass
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                {selectable ? (
                  <td className={cellPadding}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row, index)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label="행 선택"
                    />
                  </td>
                ) : null}
                {visibleColumns.map((column) => (
                  <td
                    key={String(column.key)}
                    style={getColumnStyle(column)}
                    className={`${cellPadding} ${cellText} ${rowBgClass} ${getPinnedCellClass(
                      column.pin,
                    )} text-neutral-700 dark:text-neutral-200 ${
                      column.widthClass ?? ""
                    } ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {row[column.key]}
                  </td>
                ))}
                {renderRowActions ? (
                  <td className={`${cellPadding} ${cellText} text-right`}>
                    <span onClick={(event) => event.stopPropagation()}>
                      <span
                        className={
                          showActionsOnHover ? "opacity-0 transition group-hover:opacity-100" : ""
                        }
                      >
                        {renderRowActions(row)}
                      </span>
                    </span>
                  </td>
                ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
