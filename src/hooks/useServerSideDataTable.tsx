import { useState, useEffect, useCallback } from 'react';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

export interface ServerSideTableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: Array<{
    id: string;
    desc: boolean;
  }>;
  columnFilters: Array<{
    id: string;
    value: string;
  }>;
  globalFilter: string;
}

export interface ServerSideDataResponse<TData> {
  data: TData[];
  totalCount: number;
  pageCount: number;
}

export interface UseServerSideDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  fetchData: (state: ServerSideTableState) => Promise<ServerSideDataResponse<TData>>;
  pageSize?: number;
  enableGlobalSearch?: boolean;
  enableColumnSearch?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  searchableColumns?: string[];
}

export function useServerSideDataTable<TData>({
  columns,
  fetchData,
  pageSize = 10,
  enableGlobalSearch = true,
  enableColumnSearch = true,
  enablePagination = true,
  enableSorting = true,
  searchableColumns = [],
}: UseServerSideDataTableProps<TData>) {
  const [data, setData] = useState<TData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tableState, setTableState] = useState<ServerSideTableState>({
    pagination: {
      pageIndex: 0,
      pageSize,
    },
    sorting: [],
    columnFilters: [],
    globalFilter: '',
  });

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Fetch data when table state changes
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchData(tableState);
      setData(response.data);
      setTotalCount(response.totalCount);
      setPageCount(response.pageCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, tableState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: enablePagination,
    manualSorting: enableSorting,
    manualFiltering: enableGlobalSearch || enableColumnSearch,
    pageCount: pageCount,
    state: {
      pagination: enablePagination ? tableState.pagination : undefined,
      sorting: enableSorting ? tableState.sorting : undefined,
      columnVisibility,
      globalFilter: enableGlobalSearch ? tableState.globalFilter : undefined,
    },
    onPaginationChange: enablePagination ? (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater(tableState.pagination)
        : updater;
      
      setTableState(prev => ({
        ...prev,
        pagination: newPagination,
      }));
    } : undefined,
    onSortingChange: enableSorting ? (updater) => {
      const newSorting = typeof updater === 'function'
        ? updater(tableState.sorting)
        : updater;
      
      setTableState(prev => ({
        ...prev,
        sorting: newSorting,
      }));
    } : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: enableGlobalSearch ? (value) => {
      setTableState(prev => ({
        ...prev,
        globalFilter: value,
        pagination: { ...prev.pagination, pageIndex: 0 }, // Reset to first page
      }));
    } : undefined,
  });

  const setGlobalFilter = useCallback((value: string) => {
    if (!enableGlobalSearch) return;
    
    setTableState(prev => ({
      ...prev,
      globalFilter: value,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  }, [enableGlobalSearch]);

  const setColumnFilter = useCallback((columnId: string, value: string) => {
    if (!enableColumnSearch) return;
    
    setTableState(prev => {
      const existingFilters = prev.columnFilters.filter(f => f.id !== columnId);
      const newFilters = value 
        ? [...existingFilters, { id: columnId, value }]
        : existingFilters;
      
      return {
        ...prev,
        columnFilters: newFilters,
        pagination: { ...prev.pagination, pageIndex: 0 }, // Reset to first page
      };
    });
  }, [enableColumnSearch]);

  const clearFilters = useCallback(() => {
    setTableState(prev => ({
      ...prev,
      globalFilter: '',
      columnFilters: [],
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
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

  // Get visible data for export (current page only)
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

  // Get all data for export (requires server call)
  const getAllDataForExport = useCallback(async () => {
    const allDataState: ServerSideTableState = {
      ...tableState,
      pagination: {
        pageIndex: 0,
        pageSize: totalCount, // Get all records
      },
    };

    try {
      const response = await fetchData(allDataState);
      const visibleColumns = table.getVisibleLeafColumns();
      
      return {
        headers: visibleColumns.map(col => col.columnDef.header as string),
        data: response.data.map((row: any) =>
          visibleColumns.map(col => {
            const value = row[col.id];
            return String(value || '');
          })
        ),
      };
    } catch (err) {
      console.error('Error fetching all data for export:', err);
      throw err;
    }
  }, [fetchData, tableState, totalCount, table]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    table,
    data,
    loading,
    error,
    totalCount,
    pageCount,
    globalFilter: tableState.globalFilter,
    setGlobalFilter,
    columnFilters: tableState.columnFilters,
    setColumnFilter,
    clearFilters,
    columnVisibility,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
    getVisibleData,
    getAllDataForExport,
    refreshData,
    searchableColumns,
  };
}