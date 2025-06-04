import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Project } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface ProjectDataTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const ProjectDataTable = ({ 
  projects, 
  onEdit, 
  onDelete, 
  loading = false 
}: ProjectDataTableProps) => {
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue('name')}</div>
      ),
    },
    {
      id: 'client',
      header: 'Client',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="text-gray-600">
            {project.clients?.company || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="text-gray-600 max-w-xs truncate">
          {row.getValue('description') || 'No description'}
        </div>
      ),
    },
    {
      id: 'timeline',
      header: 'Timeline',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(project.start_date).toLocaleDateString()}
            </div>
            {project.end_date && (
              <div className="text-xs text-gray-500">
                to {new Date(project.end_date).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-medium text-green-600">
          <DollarSign className="h-3 w-3" />
          {((row.getValue('budget') as number) || 0).toLocaleString()}
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
            status === 'active' ? 'default' : 
            status === 'completed' ? 'default' : 
            status === 'on_hold' ? 'secondary' : 'outline'
          }>
            {status?.replace('_', ' ')}
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
        const project = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
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
                onDelete(project.id);
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

  const searchableColumns = ['name', 'description', 'status'];

  return (
    <DataTable
      data={projects}
      columns={columns}
      title="Project Management"
      description={`Manage projects and track progress (${projects.length} projects)`}
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