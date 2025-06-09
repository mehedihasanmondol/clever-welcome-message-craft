import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FolderOpen, 
  Clock, 
  Calendar,
  FileText, 
  Wallet,
  Bell,
  DollarSign,
  Shield,
  User,
  Calculator,
  Menu,
  X
} from "lucide-react";

interface FloatingNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasPermission: (permission: string) => boolean;
}

export const FloatingNavigation = ({ activeTab, onTabChange, hasPermission }: FloatingNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      permission: "dashboard_view"
    },
    { 
      id: "personal-dashboard", 
      label: "My Dashboard", 
      icon: User,
      permission: null
    },
    { 
      id: "profiles", 
      label: "Profiles", 
      icon: Users,
      permission: "employees_view"
    },
    { 
      id: "clients", 
      label: "Clients", 
      icon: Building2,
      permission: "clients_view"
    },
    { 
      id: "projects", 
      label: "Projects", 
      icon: FolderOpen,
      permission: "projects_view"
    },
    { 
      id: "working-hours", 
      label: "Working Hours", 
      icon: Clock,
      permission: "working_hours_view"
    },
    { 
      id: "roster", 
      label: "Roster", 
      icon: Calendar,
      permission: "roster_view"
    },
    { 
      id: "payroll", 
      label: "Payroll", 
      icon: DollarSign,
      permission: "payroll_view"
    },
    { 
      id: "salary", 
      label: "Salary Management", 
      icon: Calculator,
      permission: "payroll_view"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell,
      permission: "notifications_view"
    },
    { 
      id: "reports", 
      label: "Reports", 
      icon: FileText,
      permission: "reports_view"
    },
    { 
      id: "bank-balance", 
      label: "Bank Balance", 
      icon: Wallet,
      permission: "bank_balance_view"
    },
    { 
      id: "permissions", 
      label: "Permissions", 
      icon: Shield,
      permission: "employees_manage"
    },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.permission === null || hasPermission(item.permission)
  );

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Grid */}
      {isOpen && (
        <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg transition-colors text-xs",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-30 transition-all duration-300",
          isOpen && "rotate-45"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
};