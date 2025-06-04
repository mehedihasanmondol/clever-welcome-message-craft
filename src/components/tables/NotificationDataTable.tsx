import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, CheckCircle, Bell, AlertCircle } from 'lucide-react';
import { Notification } from '@/types/database';
import { DataTable } from '@/components/ui/data-table';

interface NotificationDataTableProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
  loading?: boolean;
}

export const NotificationDataTable = ({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  onAction,
  loading = false 
}: NotificationDataTableProps) => {
  const columns: ColumnDef<Notification>[] = [
    {
      id: 'priority_icon',
      header: '',
      cell: ({ row }) => {
        const notification = row.original;
        const priority = notification.priority;
        return (
          <div className="flex justify-center">
            {priority === 'high' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : priority === 'medium' ? (
              <Bell className="h-4 w-4 text-yellow-500" />
            ) : (
              <Bell className="h-4 w-4 text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className={`font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
            {row.getValue('title')}
          </div>
        );
      },
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className={`text-sm max-w-xs truncate ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
            {row.getValue('message')}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {(row.getValue('type') as string)?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        return (
          <Badge variant={
            priority === 'high' ? 'destructive' : 
            priority === 'medium' ? 'secondary' : 'outline'
          }>
            {priority}
          </Badge>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={notification.is_read ? 'default' : 'secondary'}>
              {notification.is_read ? 'Read' : 'Unread'}
            </Badge>
            {notification.is_actioned && (
              <Badge variant="outline" className="text-xs">
                Actioned
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'sender',
      header: 'From',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className="text-gray-600 text-sm">
            System
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-gray-600 text-sm">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className="flex items-center gap-2">
            {!notification.is_read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {onAction && notification.action_type !== 'none' && !notification.is_actioned && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(notification);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
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

  const searchableColumns = ['title', 'message', 'type', 'priority'];

  return (
    <DataTable
      data={notifications}
      columns={columns}
      title="Notifications"
      description={`View and manage your notifications (${notifications.length} notifications)`}
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