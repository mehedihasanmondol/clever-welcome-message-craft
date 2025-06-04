import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CreditCard } from 'lucide-react';
import { Profile } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface ProfileDataTableProps {
  profiles: Profile[];
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
  onManageBank?: (profile: Profile) => void;
  loading?: boolean;
}

export const ProfileDataTable = ({ 
  profiles, 
  onEdit, 
  onDelete, 
  onManageBank, 
  loading = false 
}: ProfileDataTableProps) => {
  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Administrator',
      employee: 'Employee',
      accountant: 'Accountant',
      operation: 'Operations',
      sales_manager: 'Sales Manager'
    };
    return roleLabels[role] || role;
  };

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue('full_name') || 'Unnamed User'}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue('phone') || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="text-gray-600">{getRoleLabel(row.getValue('role'))}</div>
      ),
    },
    {
      accessorKey: 'employment_type',
      header: 'Employment Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue('employment_type') || 'N/A'}
        </Badge>
      ),
    },
    {
      accessorKey: 'hourly_rate',
      header: 'Hourly Rate',
      cell: ({ row }) => (
        <div className="font-medium text-green-600">
          ${((row.getValue('hourly_rate') as number) || 0).toFixed(2)}/hr
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
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
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(profile);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {onManageBank && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onManageBank(profile);
                }}
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(profile.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const searchableColumns = ['full_name', 'email', 'role', 'employment_type'];

  return (
    <DataTable
      data={profiles}
      columns={columns}
      title="Profile Management"
      description={`Manage user profiles and their information (${profiles.length} profiles)`}
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