import { useState, useMemo, useCallback } from 'react';
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';

export interface UseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageSize?: number;
  searchableColumns?: string[];
  enableGlobalSearch?: boolean;
  enableColumnSearch?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
}

export function useDataTable<TData>({
  data,
  columns,
  pageSize = 10,
  searchableColumns = [],
  enableGlobalSearch = true,
  enableColumnSearch = true,
  enablePagination = true,
  enableSorting = true,
}: UseDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  // Memoized filtered data based on global and column filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply global filter
    if (enableGlobalSearch && globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      filtered = filtered.filter((row: any) =>
        searchableColumns.some(column => {
          const value = row[column];
          return value && String(value).toLowerCase().includes(searchTerm);
        })
      );
    }

    // Apply column filters
    if (enableColumnSearch) {
      Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
        if (filterValue) {
          filtered = filtered.filter((row: any) => {
            const value = row[columnId];
            return value && String(value).toLowerCase().includes(filterValue.toLowerCase());
          });
        }
      });
    }

    return filtered;
  }, [data, globalFilter, columnFilters, searchableColumns, enableGlobalSearch, enableColumnSearch]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableColumnSearch ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility,
      pagination: enablePagination ? pagination : undefined,
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: enablePagination ? setPagination : undefined,
    enableSorting,
    enableColumnFilters: enableColumnSearch,
    enableGlobalFilter: enableGlobalSearch,
  });

  const setColumnFilter = useCallback((columnId: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setGlobalFilter('');
    setColumnFilters({});
  }, []);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  const showAllColumns = useCallback(() => {
    setColumnVisibility({});
  }, []);

  const hideAllColumns = useCallback(() => {
    const allHidden = columns.reduce((acc, column) => {
      if ('accessorKey' in column && column.accessorKey) {
        acc[column.accessorKey as string] = false;
      }
      return acc;
    }, {} as Record<string, boolean>);
    setColumnVisibility(allHidden);
  }, [columns]);

  // Get visible data for export
  const getVisibleData = useCallback(() => {
    const visibleColumns = table.getVisibleLeafColumns();
    const rows = table.getRowModel().rows;

    return {
      headers: visibleColumns.map(col => col.columnDef.header as string),
      data: rows.map(row =>
        visibleColumns.map(col => {
          const value = row.getValue(col.id);
          return String(value || '');
        })
      ),
    };
  }, [table]);

  return {
    table,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilter,
    clearFilters,
    columnVisibility,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
    getVisibleData,
    filteredData,
    totalRows: filteredData.length,
  };
}