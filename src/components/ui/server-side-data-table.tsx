import { ReactNode, useState } from 'react';
import { flexRender, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Download,
  Printer,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  FileSpreadsheet,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useServerSideDataTable, ServerSideTableState, ServerSideDataResponse } from '@/hooks/useServerSideDataTable';
import { useDataExport } from '@/hooks/useDataExport';
import { cn } from '@/lib/utils';

export interface ServerSideDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  fetchData: (state: ServerSideTableState) => Promise<ServerSideDataResponse<TData>>;
  title?: string;
  description?: string;
  searchableColumns?: string[];
  pageSize?: number;
  enableGlobalSearch?: boolean;
  enableColumnSearch?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableExport?: boolean;
  enablePrint?: boolean;
  enableColumnVisibility?: boolean;
  className?: string;
  onRowClick?: (row: TData) => void;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
}

export function ServerSideDataTable<TData>({
  columns,
  fetchData,
  title,
  description,
  searchableColumns = [],
  pageSize = 10,
  enableGlobalSearch = true,
  enableColumnSearch = true,
  enablePagination = true,
  enableSorting = true,
  enableExport = true,
  enablePrint = true,
  enableColumnVisibility = true,
  className,
  onRowClick,
  emptyState,
  toolbar,
}: ServerSideDataTableProps<TData>) {
  const [showColumnSearch, setShowColumnSearch] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const {
    table,
    data,
    loading,
    error,
    totalCount,
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
    getAllDataForExport,
    refreshData,
  } = useServerSideDataTable({
    columns,
    fetchData,
    pageSize,
    searchableColumns,
    enableGlobalSearch,
    enableColumnSearch,
    enablePagination,
    enableSorting,
  });

  const { exportToCSV, exportToExcel, exportToPDF, printData } = useDataExport();

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      const exportData = await getAllDataForExport();
      const filename = title ? title.toLowerCase().replace(/\s+/g, '-') : 'data-export';

      switch (format) {
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'excel':
          exportToExcel(exportData, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, filename, title);
          break;
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    setExportLoading(true);
    try {
      const exportData = await getAllDataForExport();
      printData(exportData, title);
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const visibleColumns = table.getVisibleLeafColumns();
  const hasFilters = globalFilter || columnFilters.some(f => f.value);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading data: {error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle className="text-2xl font-bold">{title}</CardTitle>}
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {toolbar}
            
            {/* Refresh Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            
            {/* Export & Print Actions */}
            {(enableExport || enablePrint) && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" disabled={exportLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    {enableExport && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleExport('csv')}
                          disabled={exportLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleExport('excel')}
                          disabled={exportLoading}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export Excel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleExport('pdf')}
                          disabled={exportLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                        {enablePrint && <Separator />}
                      </>
                    )}
                    {enablePrint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handlePrint}
                        disabled={exportLoading}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Column Visibility */}
            {enableColumnVisibility && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Column Visibility</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={showAllColumns}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Show All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={hideAllColumns}
                          className="h-6 px-2 text-xs"
                        >
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hide All
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {table.getAllLeafColumns().map((column) => {
                        if (!column.getCanHide()) return null;
                        
                        return (
                          <div key={column.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={column.id}
                              checked={column.getIsVisible()}
                              onCheckedChange={() => toggleColumnVisibility(column.id)}
                            />
                            <label
                              htmlFor={column.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {column.columnDef.header as string}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Global Search */}
            {enableGlobalSearch && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search all columns..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
                {globalFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setGlobalFilter('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Column Search Toggle */}
            {enableColumnSearch && (
              <Button
                variant={showColumnSearch ? "default" : "outline"}
                size="sm"
                onClick={() => setShowColumnSearch(!showColumnSearch)}
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                Column Search
              </Button>
            )}

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}

            {/* Results Count */}
            <Badge variant="secondary" className="ml-auto">
              {totalCount} result{totalCount !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Column Search Inputs */}
          {enableColumnSearch && showColumnSearch && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {visibleColumns.map((column) => (
                <div key={column.id} className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    {column.columnDef.header as string}
                  </label>
                  <div className="relative">
                    <Input
                      placeholder={`Filter ${column.columnDef.header as string}...`}
                      value={columnFilters.find(f => f.id === column.id)?.value || ''}
                      onChange={(e) => setColumnFilter(column.id, e.target.value)}
                      className="text-sm"
                      disabled={loading}
                    />
                    {columnFilters.find(f => f.id === column.id)?.value && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setColumnFilter(column.id, '')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-2">
                          {enableSorting && header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8 data-[state=open]:bg-accent"
                              onClick={() => header.column.toggleSorting()}
                              disabled={loading}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <ArrowUp className="ml-2 h-3 w-3" />,
                                desc: <ArrowDown className="ml-2 h-3 w-3" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className="ml-2 h-3 w-3" />
                              )}
                            </Button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-muted-foreground">No results found.</p>
                        {hasFilters && (
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear filters
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {enablePagination && (
          <div className="flex items-center justify-between space-x-6 lg:space-x-8 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || loading}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage() || loading}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}