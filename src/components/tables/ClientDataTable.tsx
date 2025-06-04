import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Building, Mail, Phone } from 'lucide-react';
import { Client } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface ClientDataTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const ClientDataTable = ({ 
  clients, 
  onEdit, 
  onDelete, 
  loading = false 
}: ClientDataTableProps) => {
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

  const searchableColumns = ['company', 'name', 'email', 'status'];

  return (
    <DataTable
      data={clients}
      columns={columns}
      title="Client Management"
      description={`Manage clients and company contacts (${clients.length} clients)`}
      searchableColumns={searchableColumns}
      loading={loading}
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