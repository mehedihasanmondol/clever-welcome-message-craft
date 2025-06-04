import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Building, Mail, Phone } from 'lucide-react';
import { Client } from '@/types/database';
import { ServerSideDataTable } from '@/components/ui/server-side-data-table';
import { ServerSideTableState, ServerSideDataResponse } from '@/hooks/useServerSideDataTable';
import { supabase } from '@/integrations/supabase/client';

interface ServerSideClientDataTableProps {
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export const ServerSideClientDataTable = ({ 
  onEdit, 
  onDelete
}: ServerSideClientDataTableProps) => {
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-400" />
          <div className="font-medium text-gray-900">{row.getValue('company')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Contact Name',
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4" />
          {row.getValue('email')}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4" />
          {row.getValue('phone') || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(client);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(client.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const fetchClients = async (state: ServerSideTableState): Promise<ServerSideDataResponse<Client>> => {
    try {
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      // Apply global search
      if (state.globalFilter) {
        query = query.or(`company.ilike.%${state.globalFilter}%,name.ilike.%${state.globalFilter}%,email.ilike.%${state.globalFilter}%,status.ilike.%${state.globalFilter}%`);
      }

      // Apply column filters
      state.columnFilters.forEach(filter => {
        if (filter.value) {
          query = query.ilike(filter.id, `%${filter.value}%`);
        }
      });

      // Apply sorting
      if (state.sorting.length > 0) {
        const sort = state.sorting[0];
        query = query.order(sort.id, { ascending: !sort.desc });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = state.pagination.pageIndex * state.pagination.pageSize;
      const to = from + state.pagination.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const pageCount = Math.ceil(totalCount / state.pagination.pageSize);

      return {
        data: (data || []) as Client[],
        totalCount,
        pageCount,
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  };

  const searchableColumns = ['company', 'name', 'email', 'status'];

  return (
    <ServerSideDataTable
      columns={columns}
      fetchData={fetchClients}
      title="Client Management"
      description="Manage clients and company contacts"
      searchableColumns={searchableColumns}
      enableGlobalSearch={true}
      enableColumnSearch={true}
      enablePagination={true}
      enableSorting={true}
      enableExport={true}
      enablePrint={true}
      enableColumnVisibility={true}
      pageSize={10}
    />
  );
};