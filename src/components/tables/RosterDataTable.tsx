import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Calendar } from 'lucide-react';
import { Roster } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface RosterDataTableProps {
  rosters: Roster[];
  onEdit: (roster: Roster) => void;
  onDelete: (id: string) => void;
  onViewProfiles?: (roster: Roster) => void;
  loading?: boolean;
}

export const RosterDataTable = ({ 
  rosters, 
  onEdit, 
  onDelete, 
  onViewProfiles,
  loading = false 
}: RosterDataTableProps) => {
  const columns: ColumnDef<Roster>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue('name') || 'Unnamed Roster'}
        </div>
      ),
    },
    {
      id: 'client_project',
      header: 'Client/Project',
      cell: ({ row }) => {
        const roster = row.original;
        return (
          <div>
            {roster.clients?.company && (
              <div>
                <div className="font-medium">{roster.clients.company}</div>
                {roster.projects?.name && (
                  <div className="text-sm text-gray-500">{roster.projects.name}</div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Start Date',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {new Date(row.getValue('date')).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => {
        const endDate = row.getValue('end_date');
        return (
          <div className="text-gray-600">
            {endDate ? new Date(endDate as string).toLocaleDateString() : 'Single Day'}
          </div>
        );
      },
    },
    {
      id: 'time_schedule',
      header: 'Schedule',
      cell: ({ row }) => {
        const roster = row.original;
        return (
          <div className="text-sm">
            <div>{roster.start_time} - {roster.end_time}</div>
            <div className="text-xs text-gray-500">{roster.total_hours}h total</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'expected_profiles',
      header: 'Expected Staff',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline">
            {row.getValue('expected_profiles')} staff
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'per_hour_rate',
      header: 'Rate/Hour',
      cell: ({ row }) => (
        <div className="font-medium text-green-600">
          ${((row.getValue('per_hour_rate') as number) || 0).toFixed(2)}/hr
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
            status === 'approved' ? 'default' : 
            status === 'pending' ? 'secondary' : 'outline'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'editable',
      header: 'Editable',
      cell: ({ row }) => {
        const roster = row.original;
        return (
          <Badge variant={roster.is_editable ? 'default' : 'destructive'}>
            {roster.is_editable ? 'Yes' : 'Locked'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const roster = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(roster);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {onViewProfiles && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfiles(roster);
                }}
                className="text-purple-600 hover:text-purple-700"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(roster.id);
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

  const searchableColumns = ['name', 'status'];

  return (
    <DataTable
      data={rosters}
      columns={columns}
      title="Roster Management"
      description={`Schedule and manage work rosters and staff assignments (${rosters.length} rosters)`}
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