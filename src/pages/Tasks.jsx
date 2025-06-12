import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Calendar, User, Flag, Folder, Clock, X, Search, Filter } from 'lucide-react';
import api from '../api';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({
    title: '',
    description: '',
    assigned_user: '',
    start_date: '',
    end_date: '',
    status: 'Pending',
    priority: 'Medium',
    project_id: '',
    created_by: '',
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // All the existing fetch functions and handlers remain the same
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const formattedTasks = response.data.map((task) => ({
        ...task,
        start_date: task.start_date
          ? new Date(task.start_date).toISOString().slice(0, 16)
          : '',
        end_date: task.end_date
          ? new Date(task.end_date).toISOString().slice(0, 16)
          : '',
      }));
      setTasks(formattedTasks);
    } catch (err) {
      setError('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/tas/users');
      setUsers(response.data);
    } catch (err) {
      setError('Error fetching users');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/tas/projects');
      setProjects(response.data);
    } catch (err) {
      setError('Error fetching projects');
    }
  };

  const fetchTask = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data);
      setEditMode(true);
      setCurrentTaskId(taskId);
      setShowForm(true);
    } catch (err) {
      setError('Error fetching task');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
    const createdBy = localStorage.getItem('id');
    setTask((prevState) => ({
      ...prevState,
      created_by: createdBy || prevState.created_by,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const combinedTask = {
      ...task,
      start_date: task.start_date,
      end_date: task.end_date,
    };
    try {
      if (editMode) {
        await api.put(`/tasks/${currentTaskId}`, combinedTask);
      } else {
        await api.post('/tasks', combinedTask);
      }
      setTask({
        title: '',
        description: '',
        assigned_user: '',
        start_date: '',
        end_date: '',
        status: 'Pending',
        priority: 'Medium',
        project_id: '',
        created_by: '',
      });
      setEditMode(false);
      setCurrentTaskId(null);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError('Error saving task');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError('Error deleting task');
    }
  };

  const handleNewTask = () => {
    setTask({
      title: '',
      description: '',
      assigned_user: '',
      start_date: '',
      end_date: '',
      status: 'Pending',
      priority: 'Medium',
      project_id: '',
      created_by: '',
    });
    setEditMode(false);
    setCurrentTaskId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentTaskId(null);
    setTask({
      title: '',
      description: '',
      assigned_user: '',
      start_date: '',
      end_date: '',
      status: 'Pending',
      priority: 'Medium',
      project_id: '',
      created_by: '',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Pending':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    const baseClasses = "w-4 h-4";
    switch (priority) {
      case 'High':
        return <Flag className={`${baseClasses} text-red-500`} />;
      case 'Medium':
        return <Flag className={`${baseClasses} text-amber-500`} />;
      case 'Low':
        return <Flag className={`${baseClasses} text-emerald-500`} />;
      default:
        return <Flag className={`${baseClasses} text-gray-500`} />;
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-800 bg-clip-text text-transparent">
                Task Management
              </h1>
              <p className="text-slate-600 mt-2">Organize, track, and manage your team's tasks efficiently</p>
            </div>
            <button
              onClick={handleNewTask}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create New Task
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {editMode ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Task Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={task.title}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={task.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                      placeholder="Describe the task details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <User className="w-4 h-4 inline mr-2" />
                      Assigned User
                    </label>
                    <select
                      name="assigned_user"
                      value={task.assigned_user}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <Folder className="w-4 h-4 inline mr-2" />
                      Project
                    </label>
                    <select
                      name="project_id"
                      value={task.project_id}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={task.start_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={task.end_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Status
                    </label>
                    <select
                      name="status"
                      value={task.status}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <Flag className="w-4 h-4 inline mr-2" />
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={task.priority}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-300 shadow-sm px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {editMode ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {!loading && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Task Overview</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Task Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status & Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-slate-600 max-w-xs truncate">{task.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{task.assigned_user}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Folder className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-500">{task.project_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(task.priority)}
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">Start:</span>
                            <span>{new Date(task.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">End:</span>
                            <span>{new Date(task.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchTask(task.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTasks.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg mb-2">No tasks found</div>
                  <p className="text-slate-500">Create your first task to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <div className="text-slate-600 text-lg font-medium">Loading tasks...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;