import React, { useEffect, useState } from "react";
import axios from "../api";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Activity, Users, DollarSign, Briefcase, Clock, TrendingUp, CheckCircle, Calendar } from "lucide-react";

// Card Components
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  const [projectStats, setProjectStats] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);

  // Modern color palette
  const colors = {
    primary: "#2563eb",    // Blue
    secondary: "#0891b2",  // Cyan
    tertiary: "#0d9488",   // Teal
    quaternary: "#6366f1", // Indigo
    success: "#059669",    // Green
    warning: "#d97706",    // Amber
    info: "#0284c7",       // Light Blue
    error: "#dc2626",      // Red
    background: "#f0f9ff", // Light Blue bg
    gradientStart: "#1d4ed8",
    gradientEnd: "#2563eb"
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        projectStatusRes,
        taskStatusRes,
        recentProjectsRes,
        recentTasksRes,
        totalUsersRes,
        totalBudgetRes
      ] = await Promise.all([
        axios.get("/dashboard/projects/status"),
        axios.get("/dashboard/tasks/status"),
        axios.get("/dashboard/projects/recent"),
        axios.get("/dashboard/tasks/recent"),
        axios.get("/dashboard/users/count"),
        axios.get("/dashboard/projects/budget")
      ]);

      setProjectStats(projectStatusRes.data);
      setTaskStats(taskStatusRes.data);
      setRecentProjects(recentProjectsRes.data);
      setRecentTasks(recentTasksRes.data);
      setTotalUsers(totalUsersRes.data.total_users);
      setTotalBudget(totalBudgetRes.data.total_budget);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data
  const projectChartData = projectStats.map(stat => ({
    name: stat.status,
    value: stat.count
  }));

  const taskChartData = taskStats.map(stat => ({
    name: stat.status,
    value: stat.count
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Header */}
      <div className="p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-blue mb-2">Dashboard Overview</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {projectStats.reduce((acc, curr) => acc + curr.count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {taskStats.reduce((acc, curr) => acc + curr.count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900">
                    RWF {totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                Projects by Status
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={colors.primary} radius={[8, 8, 0, 0]}>
                      {projectChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={[colors.primary, colors.secondary, colors.tertiary, colors.quaternary][index % 4]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-blue-600" />
                Tasks Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={130}
                      fill={colors.primary}
                      dataKey="value"
                    >
                      {taskChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={[colors.primary, colors.secondary, colors.tertiary, colors.quaternary][index % 4]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Updates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                Recent Projects
              </h2>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group bg-blue-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300 hover:bg-blue-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {project.project_name}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 mt-2 group-hover:bg-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {project.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-blue-600" />
                Recent Tasks
              </h2>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group bg-blue-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300 hover:bg-blue-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {task.title}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 mt-2 group-hover:bg-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {task.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                        {new Date(task.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;