
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Briefcase, Clock, DollarSign, Building, FileText, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProfiles: 0,
    activeProjects: 0,
    pendingHours: 0,
    totalRevenue: 0,
    bankAccounts: 0,
    completedProjects: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('current_week');
  const [chartData, setChartData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [hoursData, setHoursData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'current_week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        break;
      case 'last_week':
        const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay() - 1));
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    }

    return { startDate, endDate };
  };

  const fetchDashboardData = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch profiles count
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Fetch projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status');

      if (projectsError) throw projectsError;

      // Fetch working hours for date range
      const { data: workingHours, error: workingHoursError } = await supabase
        .from('working_hours')
        .select(`
          total_hours,
          status,
          date,
          profiles!working_hours_profile_id_fkey (id, full_name),
          projects!working_hours_project_id_fkey (id, name)
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (workingHoursError) throw workingHoursError;

      // Fetch bank transactions for revenue
      const { data: transactions, error: transactionsError } = await supabase
        .from('bank_transactions')
        .select('amount, type, date')
        .eq('type', 'deposit')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (transactionsError) throw transactionsError;

      // Fetch bank accounts count
      const { data: bankAccounts, error: bankAccountsError } = await supabase
        .from('bank_accounts')
        .select('id');

      if (bankAccountsError) throw bankAccountsError;

      // Fetch recent working hours with profiles for activities
      const { data: recentHours, error: recentHoursError } = await supabase
        .from('working_hours')
        .select(`
          *,
          profiles!working_hours_profile_id_fkey (id, full_name),
          projects!working_hours_project_id_fkey (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentHoursError) throw recentHoursError;

      // Calculate stats
      const totalProfiles = profiles?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      
      // Handle working hours data safely
      const pendingHours = (workingHours || []).filter(wh => wh.status === 'pending').reduce((sum, wh) => sum + wh.total_hours, 0);
      const totalHours = (workingHours || []).reduce((sum, wh) => sum + wh.total_hours, 0);
      
      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalBankAccounts = bankAccounts?.length || 0;

      // Prepare chart data for hours over time
      const hoursChartData = (workingHours || []).reduce((acc: any[], wh) => {
        const date = wh.date;
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.hours += wh.total_hours;
        } else {
          acc.push({ date, hours: wh.total_hours });
        }
        return acc;
      }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Prepare project data for charts
      const projectChartData = (workingHours || []).reduce((acc: any[], wh) => {
        const projectName = wh.projects?.name || 'Unknown';
        const existing = acc.find(item => item.name === projectName);
        if (existing) {
          existing.hours += wh.total_hours;
        } else {
          acc.push({ name: projectName, hours: wh.total_hours });
        }
        return acc;
      }, []);

      // Prepare revenue data for charts
      const revenueChartData = (transactions || []).reduce((acc: any[], t) => {
        const date = t.date;
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.revenue += t.amount;
        } else {
          acc.push({ date, revenue: t.amount });
        }
        return acc;
      }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Format recent activities with safe data handling
      const activities = (recentHours || []).map(wh => {
        const profileName = wh.profiles?.full_name || 'Unknown User';
        const projectName = wh.projects?.name || 'Unknown Project';
        
        return {
          type: 'hours',
          description: `${profileName} logged ${wh.total_hours}h for ${projectName}`,
          time: new Date(wh.created_at).toLocaleDateString(),
          status: wh.status
        };
      });

      setStats({
        totalProfiles,
        activeProjects,
        pendingHours,
        totalRevenue,
        bankAccounts: totalBankAccounts,
        completedProjects
      });

      setRecentActivities(activities);
      setChartData(revenueChartData);
      setProjectData(projectChartData);
      setHoursData(hoursChartData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { 
      title: "Total Profiles", 
      value: stats.totalProfiles.toString(), 
      icon: Users, 
      color: "text-blue-600" 
    },
    { 
      title: "Active Projects", 
      value: stats.activeProjects.toString(), 
      icon: Briefcase, 
      color: "text-green-600" 
    },
    { 
      title: "Pending Hours", 
      value: `${stats.pendingHours}h`, 
      icon: Clock, 
      color: "text-orange-600" 
    },
    { 
      title: "Total Revenue", 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-emerald-600" 
    },
    { 
      title: "Bank Accounts", 
      value: stats.bankAccounts.toString(), 
      icon: Building, 
      color: "text-purple-600" 
    },
    { 
      title: "Completed Projects", 
      value: stats.completedProjects.toString(), 
      icon: FileText, 
      color: "text-gray-600" 
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your business management overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="current_week">Current Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hours Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Project Hours Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-sm">{activity.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
