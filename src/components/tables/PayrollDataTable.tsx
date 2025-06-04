import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { Payroll } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface PayrollDataTableProps {
  payrolls: Payroll[];
  onEdit: (payroll: Payroll) => void;
  onDelete: (id: string) => void;
  onView?: (payroll: Payroll) => void;
  loading?: boolean;
}

export const PayrollDataTable = ({ 
  payrolls, 
  onEdit, 
  onDelete, 
  onView,
  loading = false 
}: PayrollDataTableProps) => {
  const columns: ColumnDef<Payroll>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: ({ row }) => {
        const payroll = row.original;
        return (
          <div className="font-medium text-gray-900">
            {payroll.profiles?.full_name || 'N/A'}
          </div>
        );
      },
    },
    {
      id: 'pay_period',
      header: 'Pay Period',
      cell: ({ row }) => {
        const payroll = row.original;
        return (
          <div className="text-sm">
            <div>{new Date(payroll.pay_period_start).toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">
              to {new Date(payroll.pay_period_end).toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'total_hours',
      header: 'Total Hours',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {((row.getValue('total_hours') as number) || 0).toFixed(1)}h
        </div>
      ),
    },
    {
      accessorKey: 'hourly_rate',
      header: 'Rate/Hour',
      cell: ({ row }) => (
        <div className="font-medium">
          ${((row.getValue('hourly_rate') as number) || 0).toFixed(2)}/hr
        </div>
      ),
    },
    {
      accessorKey: 'gross_pay',
      header: 'Gross Pay',
      cell: ({ row }) => (
        <div className="font-medium text-green-600">
          ${((row.getValue('gross_pay') as number) || 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'deductions',
      header: 'Deductions',
      cell: ({ row }) => (
        <div className="font-medium text-red-600">
          -${((row.getValue('deductions') as number) || 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'net_pay',
      header: 'Net Pay',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-bold text-blue-600">
          <DollarSign className="h-4 w-4" />
          {((row.getValue('net_pay') as number) || 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'paid' ? 'default' : 
            status === 'pending' ? 'secondary' : 
            status === 'processing' ? 'secondary' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'bank_account',
      header: 'Bank Account',
      cell: ({ row }) => {
        const payroll = row.original;
        return (
          <div className="text-gray-600 text-sm">
            {payroll.bank_accounts?.bank_name || 'N/A'}
          </div>
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
        const payroll = row.original;
        return (
          <div className="flex items-center gap-2">
            {onView && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(payroll);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(payroll);
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
                onDelete(payroll.id);
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

  const searchableColumns = ['status'];

  return (
    <DataTable
      data={payrolls}
      columns={columns}
      title="Payroll Management"
      description={`Manage employee payroll and payment records (${payrolls.length} payrolls)`}
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