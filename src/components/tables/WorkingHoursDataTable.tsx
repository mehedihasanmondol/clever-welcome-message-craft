import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { WorkingHour } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface WorkingHoursDataTableProps {
  workingHours: WorkingHour[];
  onEdit: (workingHour: WorkingHour) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: boolean;
}

export const WorkingHoursDataTable = ({ 
  workingHours, 
  onEdit, 
  onApprove, 
  onReject, 
  loading = false 
}: WorkingHoursDataTableProps) => {
  const columns: ColumnDef<WorkingHour>[] = [
    {
      id: 'profile',
      header: 'Profile',
      cell: ({ row }) => {
        const workingHour = row.original;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {workingHour.profiles?.full_name || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {workingHour.profiles?.role || 'N/A'}
            </div>
          </div>
        );
      },
    },
    {
      id: 'project',
      header: 'Project',
      cell: ({ row }) => {
        const workingHour = row.original;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {workingHour.projects?.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {workingHour.clients?.company || 'N/A'}
            </div>
          </div>
        );
      },
    },
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
      id: 'scheduled',
      header: 'Scheduled',
      cell: ({ row }) => {
        const workingHour = row.original;
        return (
          <div className="text-sm">
            {workingHour.start_time} - {workingHour.end_time}
            <div className="text-xs text-gray-500">{workingHour.total_hours}h</div>
          </div>
        );
      },
    },
    {
      id: 'actual',
      header: 'Actual',
      cell: ({ row }) => {
        const workingHour = row.original;
        return (
          <div className="text-sm">
            {workingHour.sign_in_time && workingHour.sign_out_time ? (
              <>
                {workingHour.sign_in_time} - {workingHour.sign_out_time}
                <div className="text-xs text-gray-500">{workingHour.actual_hours || 0}h</div>
              </>
            ) : (
              <span className="text-gray-400">Not recorded</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'overtime_hours',
      header: 'Overtime',
      cell: ({ row }) => {
        const overtime = (row.getValue('overtime_hours') as number) || 0;
        return (
          <div className={`text-sm font-medium ${
            overtime > 0 ? 'text-orange-600' : 'text-gray-600'
          }`}>
            {overtime.toFixed(1)}h
          </div>
        );
      },
    },
    {
      id: 'payable',
      header: 'Payable',
      cell: ({ row }) => {
        const workingHour = row.original;
        return (
          <div className="text-sm">
            <div className="font-medium text-purple-600">
              ${(workingHour.payable_amount || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              ${workingHour.hourly_rate || 0}/hr
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={
            status === 'approved' ? 'default' : 
            status === 'pending' ? 'secondary' : 
            status === 'paid' ? 'default' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const workingHour = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workingHour);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {workingHour.status === 'pending' && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(workingHour.id);
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(workingHour.id);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const searchableColumns = ['date', 'status'];

  return (
    <DataTable
      data={workingHours}
      columns={columns}
      title="Working Hours Management"
      description={`Track and manage working hours, overtime, and payroll calculations (${workingHours.length} entries)`}
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