import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { BankTransaction } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface TransactionDataTableProps {
  transactions: BankTransaction[];
  onEdit: (transaction: BankTransaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const TransactionDataTable = ({ 
  transactions, 
  onEdit, 
  onDelete, 
  loading = false 
}: TransactionDataTableProps) => {
  const columns: ColumnDef<BankTransaction>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {new Date(row.getValue('date')).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue('category')}
        </Badge>
      ),
    },
    {
      id: 'client_project',
      header: 'Client/Project',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div>
            {transaction.clients?.company && (
              <div>
                <div className="font-medium">{transaction.clients.company}</div>
                {transaction.projects?.name && (
                  <div className="text-sm text-gray-500">{transaction.projects.name}</div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'profile',
      header: 'Profile',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="text-gray-600">
            {transaction.profiles?.full_name || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className={`font-medium ${
            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.getValue('type') === 'deposit' ? 'default' : 'destructive'}>
          {row.getValue('type')}
        </Badge>
      ),
    },
    {
      id: 'bank_account',
      header: 'Bank Account',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="text-gray-600">
            {transaction.bank_accounts?.bank_name || 'N/A'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
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
                onDelete(transaction.id);
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

  const searchableColumns = ['description', 'category', 'type'];

  return (
    <DataTable
      data={transactions}
      columns={columns}
      title="Transaction Management"
      description={`Manage bank transactions and financial records (${transactions.length} transactions)`}
      searchableColumns={searchableColumns}
      loading={loading}
      enableGlobalSearch={true}
      enableColumnSearch={true}
      enablePagination={true}
      enableSorting={true}
      enableExport={true}
      enablePrint={true}
      enableColumnVisibility={true}
      pageSize={15}
    />
  );
};