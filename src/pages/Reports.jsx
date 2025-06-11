import React, { useEffect, useState } from "react";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Search } from "lucide-react";
import logo from "../assets/logo.png"; 

// Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 border-b ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold ${className}`}>
    {children}
  </h2>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// Alert Components
const Alert = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-50 text-blue-800 border-blue-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);

// Search box component
const SearchBox = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
      <Search size={18} />
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
    />
  </div>
);

// Tabs component for report types
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium rounded-md transition ${
      active 
        ? "bg-[#E05F00] text-white" 
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

// Common table component for consistent styling
const Table = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-separate border-spacing-0">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th 
              key={index} 
              className="text-left text-sm font-semibold text-gray-600 p-4 border-b-2 border-gray-200 bg-gray-50 sticky top-0"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white">
        {children}
      </tbody>
    </table>
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    const styles = {
      'On Track': 'bg-green-50 text-green-700 border-green-100',
      'At Risk': 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'Delayed': 'bg-red-50 text-red-700 border-red-100',
      'Overdue': 'bg-red-100 text-red-800 border-red-200',
      'Completed': 'bg-blue-50 text-blue-700 border-blue-100',
      'in_progress': 'bg-blue-50 text-blue-700 border-blue-100',
      'planning': 'bg-purple-50 text-purple-700 border-purple-100',
      'Pending': 'bg-orange-50 text-orange-700 border-orange-100'
    };
    return styles[status] || 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ percentage }) => (
  <div className="flex items-center gap-3">
    <div className="flex-grow bg-gray-100 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full rounded-full bg-[#E05F00]" 
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="text-sm font-medium text-gray-600 min-w-[45px]">
      {percentage}%
    </span>
  </div>
);

// Enhanced table row styles
const TableRow = ({ children, isEven }) => (
  <tr className={`
    border-b border-gray-100 hover:bg-gray-50 transition-colors
    ${isEven ? 'bg-white' : 'bg-gray-50/30'}
  `}>
    {children}
  </tr>
);

// Enhanced table cell
const TableCell = ({ children, className = "" }) => (
  <td className={`p-4 text-sm text-gray-600 ${className}`}>
    {children}
  </td>
);

// Empty state component
const EmptyState = ({ message = "No data available" }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <svg 
      className="w-16 h-16 mb-4 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm">Try adjusting your search or filter criteria</p>
  </div>
);

const ReportsPage = () => {
  // State for different data types
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, tasks, projects

  // Filtered data based on search query
  const getFilteredData = (data, keys) => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(item => 
      keys.some(key => 
        item[key] && 
        String(item[key]).toLowerCase().includes(query)
      )
    );
  };

  const filteredProjects = getFilteredData(projects, ['project_name', 'status', 'assigned_user']);
  const filteredProjectStatus = getFilteredData(projectStatus, ['project_name', 'project_status']);
  const filteredUsers = getFilteredData(users, ['username']);
  const filteredTasks = getFilteredData(tasks, ['task_name', 'status', 'assigned_user', 'project_name']);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const clearFilters = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Reset dates and search
      setStartDate(null);
      setEndDate(null);
      setSearchQuery("");
      
      // Fetch without any params to get all data
      await fetchReportData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (params = {}) => {
    // Common API calls for all tabs
    const [projectOverview, userPerformance, statusReport, recentUpdates] = 
      await Promise.all([
        api.get("/reports/project-overview", { params }),
        api.get("/reports/user-performance", { params }),
        api.get("/reports/project-status", { params }),
        api.get("/reports/recent-updates", { params }),
      ]);

    setProjects(projectOverview.data || []);
    setUsers(userPerformance.data || []);
    setProjectStatus(statusReport.data || []);
    setUpdates(recentUpdates.data || []);

    // Fetch task data if on tasks tab
    if (activeTab === "tasks") {
      const tasksResponse = await api.get("/reports/tasks", { params });
      setTasks(tasksResponse.data || []);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (startDate) {
        params.start_date = startDate.toISOString().split("T")[0];
      }
      if (endDate) {
        params.end_date = endDate.toISOString().split("T")[0];
      }

      await fetchReportData(params);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };


  // Then in the generatePDF function:
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const brandColor = [224, 95, 0]; // #E05F00
    
    // Add logo from assets folder
    try {
      // Add the logo to the PDF (positioned at x=14, y=10, with width=30)
      doc.addImage(logo, 'PNG', 14, 10, 30, 0);
      
      // Adjust other elements to make room for the logo
      doc.setFillColor(...brandColor);
      doc.rect(0, 0, pageWidth, 2, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(60, 60, 60);
      doc.text(`${getTitleForActiveTab()} Report`, 50, 20);
    } catch (error) {
      console.error("Error loading logo:", error);
      
      // Fallback to the original header without logo
      doc.setFillColor(...brandColor);
      doc.rect(0, 0, pageWidth, 2, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(60, 60, 60);
      doc.text(`${getTitleForActiveTab()} Report`, 14, 20);
    }   
    // Add date information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 14, 20, { align: 'right' });
    
    if (startDate || endDate) {
      const dateRange = `Date Range: ${startDate ? startDate.toLocaleDateString() : 'Start'} to ${endDate ? endDate.toLocaleDateString() : 'End'}`;
      doc.text(dateRange, pageWidth - 14, 25, { align: 'right' });
    }

    if (searchQuery) {
      doc.text(`Search: "${searchQuery}"`, pageWidth - 14, 30, { align: 'right' });
    }
    
    let yPos = 35;
    
    // Common table styles
    const tableStyle = {
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [240, 240, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [250, 250, 250],
        textColor: [80, 80, 80],
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [220, 220, 220]
      },
      bodyStyles: {
        textColor: [70, 70, 70]
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252]
      }
    };
    
    // Helper function for section headers
    const addSectionHeader = (title, y) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...brandColor);
      doc.text(title, 14, y);
      return y + 10;
    };

    // Generate different content based on active tab
    if (activeTab === "overview") {
      generateOverviewPDF(doc, addSectionHeader, tableStyle, yPos);
    } else if (activeTab === "tasks") {
      generateTasksPDF(doc, addSectionHeader, tableStyle, yPos);
    } else if (activeTab === "projects") {
      generateProjectsPDF(doc, addSectionHeader, tableStyle, yPos);
    }
    
    // Add elegant footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);
    
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.setFillColor(...brandColor);
      doc.rect(0, doc.internal.pageSize.height - 2, pageWidth, 2, 'F');
    }
    
    // Save the PDF with appropriate name
    doc.save(`${activeTab}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateOverviewPDF = (doc, addSectionHeader, tableStyle, yPos) => {
    // Only add Project Status Overview if there's data
    if (filteredProjectStatus.length > 0) {
      yPos = addSectionHeader('Project Status Overview', yPos);
      
      doc.autoTable({
        startY: yPos,
        head: [['Project Name', 'Completion', 'Days Left', 'Status', 'Tasks']],
        body: filteredProjectStatus.map(project => [
          project.project_name,
          `${project.completion_percentage}%`,
          project.days_remaining < 0 ? 'Overdue' : `${project.days_remaining} days`,
          project.project_status,
          `${project.completed_tasks}/${project.total_tasks}`
        ]),
        ...tableStyle,
        columnStyles: {
          0: { cellWidth: 50 },
          3: { cellWidth: 30 }
        }
      });
    
      yPos = doc.previousAutoTable.finalY + 20;
    }
    
    // Only add Team Performance if there's data
    if (filteredUsers.length > 0) {
      if (yPos + 100 > doc.internal.pageSize.height) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos = addSectionHeader('Team Performance', yPos);
      
      doc.autoTable({
        startY: yPos,
        head: [['Team Member', 'Total Tasks', 'Completed', 'Delayed', 'Rate']],
        body: filteredUsers.map(user => [
          user.username,
          user.total_tasks,
          user.completed_tasks,
          user.delayed_tasks,
          `${user.completion_rate}%`
        ]),
        ...tableStyle
      });
    
      yPos = doc.previousAutoTable.finalY + 20;
    }
    
    // Only add Project Details if there's data
    if (filteredProjects.length > 0) {
      if (yPos + 100 > doc.internal.pageSize.height) {
        doc.addPage();
        yPos = 20;
      }
    
      yPos = addSectionHeader('Project Details', yPos);
      
      doc.autoTable({
        startY: yPos,
        head: [['Project Name', 'Status', 'Start Date', 'End Date', 'Assigned To', 'Progress']],
        body: filteredProjects.map(project => [
          project.project_name,
          project.status,
          formatDate(project.start_date),
          formatDate(project.end_date),
          project.assigned_user,
          `${project.task_completion_rate}%`
        ]),
        ...tableStyle,
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          4: { cellWidth: 30 }
        }
      });
    
      yPos = doc.previousAutoTable.finalY + 20;
    }
    
    // Only add Recent Updates if there's data
    if (updates.length > 0) {
      if (yPos + 60 > doc.internal.pageSize.height) {
        doc.addPage();
        yPos = 20;
      }
    
      yPos = addSectionHeader('Recent Updates', yPos);
      
      doc.autoTable({
        startY: yPos,
        head: [['Month', 'Projects Updated']],
        body: updates.map(update => [
          update.month,
          update.projects_updated
        ]),
        ...tableStyle
      });
    }
  };

  const generateTasksPDF = (doc, addSectionHeader, tableStyle, yPos) => {
    if (filteredTasks.length > 0) {
      yPos = addSectionHeader('Task Report', yPos);
      
      doc.autoTable({
        startY: yPos,
        head: [['Task Name', 'Project', 'Assigned To', 'Status', 'Due Date', 'Priority']],
        body: filteredTasks.map(task => [
          task.task_name,
          task.project_name,
          task.assigned_user,
          task.status,
          formatDate(task.due_date),
          task.priority
        ]),
        ...tableStyle,
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40 },
          3: { cellWidth: 30 }
        }
      });
    
      yPos = doc.previousAutoTable.finalY + 20;
    }

    // Task status summary
    if (filteredTasks.length > 0) {
      if (yPos + 80 > doc.internal.pageSize.height) {
        doc.addPage();
        yPos = 20;
      }

      yPos = addSectionHeader('Task Status Summary', yPos);
      
      const statusCounts = filteredTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusCounts).map(([status, count]) => [
        status,
        count,
        `${((count / filteredTasks.length) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: statusData,
        ...tableStyle
      });
    }
  };

  const generateProjectsPDF = (doc, addSectionHeader, tableStyle, yPos) => {
    if (filteredProjects.length > 0) {
      yPos = addSectionHeader('Projects Report', yPos);
      
      doc.autoTable({
        startY: yPos,
        head: [['Project Name', 'Status', 'Start Date', 'End Date', 'Budget', 'Assigned To', 'Progress']],
        body: filteredProjects.map(project => [
          project.project_name,
          project.status,
          formatDate(project.start_date),
          formatDate(project.end_date),
          project.budget ? `$${project.budget.toLocaleString()}` : 'N/A',
          project.assigned_user,
          `${project.task_completion_rate}%`
        ]),
        ...tableStyle
      });
    
      yPos = doc.previousAutoTable.finalY + 20;
    }

    // Project status breakdown
    if (filteredProjectStatus.length > 0) {
      if (yPos + 80 > doc.internal.pageSize.height) {
        doc.addPage();
        yPos = 20;
      }

      yPos = addSectionHeader('Project Status Breakdown', yPos);
      
      const statusCounts = filteredProjectStatus.reduce((acc, project) => {
        acc[project.project_status] = (acc[project.project_status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusCounts).map(([status, count]) => [
        status,
        count,
        `${((count / filteredProjectStatus.length) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: statusData,
        ...tableStyle
      });
    }
  };

  const getTitleForActiveTab = () => {
    switch (activeTab) {
      case 'tasks': return 'Tasks';
      case 'projects': return 'Projects';
      default: return 'Dashboard';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to check if data is empty based on active tab
  const isDataEmpty = () => {
    if (activeTab === 'overview') {
      return filteredProjects.length === 0 && 
             filteredUsers.length === 0 && 
             filteredProjectStatus.length === 0;
    } else if (activeTab === 'tasks') {
      return filteredTasks.length === 0;
    } else if (activeTab === 'projects') {
      return filteredProjects.length === 0;
    }
    return false;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>📊 {getTitleForActiveTab()} Reports</CardTitle>
          <div className="flex gap-2">
            <TabButton 
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </TabButton>
            <TabButton 
              active={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
            >
              Tasks Report
            </TabButton>
            <TabButton 
              active={activeTab === "projects"}
              onClick={() => setActiveTab("projects")}
            >
              Projects Report
            </TabButton>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <SearchBox 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={`Search ${activeTab === "tasks" ? "tasks" : activeTab === "projects" ? "projects" : "reports"}...`}
              />
            </div>
            
            <div className="flex gap-2 items-center justify-end">
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="border rounded p-2 w-32"
                dateFormat="yyyy-MM-dd"
                placeholderText="Start date"
              />
              <span className="text-gray-500">-</span>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="border rounded p-2 w-32"
                dateFormat="yyyy-MM-dd"
                placeholderText="End date"
                minDate={startDate}
              />
              <button
                onClick={fetchReports}
                disabled={loading}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                title="Apply filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                disabled={loading || (!startDate && !endDate && !searchQuery)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition disabled:opacity-50"
              >
                Clear Filters
              </button>
              
              {activeTab === "tasks" && (
                <>
                  <button
                    onClick={() => setTasks(filteredTasks.filter(task => task.status === "Pending"))}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
                  >
                    Pending Tasks
                  </button>
                  <button
                    onClick={() => setTasks(filteredTasks.filter(task => task.status === "Completed"))}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                  >
                    Completed Tasks
                  </button>
                  <button
                    onClick={() => setTasks(filteredTasks.filter(task => task.status === "Delayed"))}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                  >
                    Delayed Tasks
                  </button>
                </>
              )}
              
              {activeTab === "projects" && (
                <>
                  <button
                    onClick={() => setProjects(filteredProjects.filter(project => project.status === "in_progress"))}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setProjects(filteredProjects.filter(project => project.status === "Completed"))}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                  >
                    Completed
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={generatePDF}
              disabled={loading || isDataEmpty()}
              className="px-4 py-2 bg-[#E05F00] text-white rounded hover:bg-[#D05500] transition disabled:opacity-50 flex items-center gap-2"
            >
              <span>Download Report</span>
              {loading && <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />}
            </button>
          </div>
        </CardContent>
      </Card>
  
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
  
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {isDataEmpty() ? (
            <EmptyState message={`No ${activeTab} data found matching your criteria`} />
          ) : (
            <>
              {/* Content for Overview tab */}
              {activeTab === "overview" && (
                <>
                  {/* Project Status Overview */}
                  {filteredProjectStatus.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>🎯 Project Status Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table headers={["Project Name", "Completion", "Days Left", "Status", "Tasks Progress"]}>
                          {filteredProjectStatus.map((project, index) => (
                            <TableRow key={project.project_id || index} isEven={index % 2 === 0}>
                              <TableCell className="font-medium text-gray-700">{project.project_name}</TableCell>
                              <TableCell>
                                <ProgressBar percentage={parseFloat(project.completion_percentage)} />
                              </TableCell>
                              <TableCell>
                                {project.days_remaining < 0 
                                  ? <span className="text-red-600 font-medium">Overdue</span>
                                  : `${project.days_remaining} days`
                                }
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={project.project_status} />
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{project.completed_tasks}</span>
                                <span className="text-gray-400"> / </span>
                                <span>{project.total_tasks} tasks</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Team Performance */}
                  {filteredUsers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>👥 Team Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table headers={["Team Member", "Total Tasks", "Completed", "Delayed", "Completion Rate"]}>
                          {filteredUsers.map((user, index) => (
                            <TableRow key={index} isEven={index % 2 === 0}>
                              <TableCell className="font-medium text-gray-700">{user.username}</TableCell>
                              <TableCell>{user.total_tasks}</TableCell>
                              <TableCell className="text-green-600">{user.completed_tasks}</TableCell>
                              <TableCell className="text-red-600">{user.delayed_tasks}</TableCell>
                              <TableCell>
                                <ProgressBar percentage={parseFloat(user.completion_rate)} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Project Details */}
                  {filteredProjects.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>📋 Project Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table headers={["Project Name", "Status", "Start Date", "End Date", "Assigned To", "Task Completion"]}>
                          {filteredProjects.map((project, index) => (
                            <TableRow key={index} isEven={index % 2 === 0}>
                              <TableCell className="font-medium text-gray-700">{project.project_name}</TableCell>
                              <TableCell>
                                <StatusBadge status={project.status} />
                              </TableCell>
                              <TableCell>{formatDate(project.start_date)}</TableCell>
                              <TableCell>{formatDate(project.end_date)}</TableCell>
                              <TableCell>{project.assigned_user}</TableCell>
                              <TableCell>
                                <ProgressBar percentage={parseFloat(project.task_completion_rate)} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Updates */}
                  {updates.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>🔄 Recent Updates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table headers={["Month", "Projects Updated"]}>
                          {updates.map((update, index) => (
                            <TableRow key={index} isEven={index % 2 === 0}>
                              <TableCell className="font-medium text-gray-700">{update.month}</TableCell>
                              <TableCell>{update.projects_updated}</TableCell>
                            </TableRow>
                          ))}
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Content for Tasks tab */}
              {activeTab === "tasks" && (
                <>
                  {/* Task Status Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>📝 Tasks Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Task status summary cards */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h3 className="text-lg font-medium text-blue-800">Total</h3>
                          <p className="text-2xl font-bold text-blue-700">{filteredTasks.length}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <h3 className="text-lg font-medium text-green-800">Completed</h3>
                          <p className="text-2xl font-bold text-green-700">
                            {filteredTasks.filter(t => t.status === 'Completed').length}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                          <h3 className="text-lg font-medium text-orange-800">Pending</h3>
                          <p className="text-2xl font-bold text-orange-700">
                            {filteredTasks.filter(t => t.status === 'Pending').length}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <h3 className="text-lg font-medium text-red-800">Delayed</h3>
                          <p className="text-2xl font-bold text-red-700">
                            {filteredTasks.filter(t => t.status === 'Delayed').length}
                          </p>
                        </div>
                      </div>

                      <Table headers={["Task Name", "Project", "Assigned To", "Status", "Due Date", "Priority"]}>
                        {filteredTasks.map((task, index) => (
                          <TableRow key={task.id || index} isEven={index % 2 === 0}>
                            <TableCell className="font-medium text-gray-700">{task.task_name}</TableCell>
                            <TableCell>{task.project_name}</TableCell>
                            <TableCell>{task.assigned_user}</TableCell>
                            <TableCell>
                              <StatusBadge status={task.status} />
                            </TableCell>
                            <TableCell>
                              {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed' ? (
                                <span className="text-red-600">{formatDate(task.due_date)}</span>
                              ) : (
                                formatDate(task.due_date)
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`
                                px-2 py-1 rounded-md text-xs font-medium
                                ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-blue-100 text-blue-700'}
                              `}>
                                {task.priority}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Content for Projects tab */}
              {activeTab === "projects" && (
                <>
                  {/* Projects Summary Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🚀 Projects Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Project status summary cards */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h3 className="text-lg font-medium text-blue-800">Total</h3>
                          <p className="text-2xl font-bold text-blue-700">{filteredProjects.length}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <h3 className="text-lg font-medium text-green-800">On Track</h3>
                          <p className="text-2xl font-bold text-green-700">
                            {filteredProjectStatus.filter(p => p.project_status === 'On Track').length}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                          <h3 className="text-lg font-medium text-yellow-800">At Risk</h3>
                          <p className="text-2xl font-bold text-yellow-700">
                            {filteredProjectStatus.filter(p => p.project_status === 'At Risk').length}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <h3 className="text-lg font-medium text-red-800">Delayed/Overdue</h3>
                          <p className="text-2xl font-bold text-red-700">
                            {filteredProjectStatus.filter(p => ['Delayed', 'Overdue'].includes(p.project_status)).length}
                          </p>
                        </div>
                      </div>

                      <Table headers={["Project Name", "Status", "Start Date", "End Date", "Budget", "Assigned To", "Progress"]}>
                        {filteredProjects.map((project, index) => (
                          <TableRow key={project.project_id || index} isEven={index % 2 === 0}>
                            <TableCell className="font-medium text-gray-700">{project.project_name}</TableCell>
                            <TableCell>
                              <StatusBadge status={project.status} />
                            </TableCell>
                            <TableCell>{formatDate(project.start_date)}</TableCell>
                            <TableCell>{formatDate(project.end_date)}</TableCell>
                            <TableCell>
                              {project.budget ? `${project.budget.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell>{project.assigned_user}</TableCell>
                            <TableCell>
                              <ProgressBar percentage={parseFloat(project.task_completion_rate)} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;