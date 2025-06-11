import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import api from '../api';

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('id');
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Delayed'];

  // Status icon mapping
  const statusIcons = {
    'Pending': <Clock className="w-5 h-5 text-gray-500" />,
    'In Progress': <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
    'Completed': <CheckCircle2 className="w-5 h-5 text-green-500" />,
    'Delayed': <AlertCircle className="w-5 h-5 text-red-500" />
  };

  useEffect(() => {
    if (!userId) {
      setError('User ID not found in localStorage');
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await api.get(`/tasks/assigned/${userId}`);
        setTasks(response.data);
        const statusMap = {};
        response.data.forEach((task) => {
          statusMap[task.id] = task.status;
        });
        setStatus(statusMap);
        setLoading(false);
      } catch (err) {
        console.error('Error Fetching Assigned Tasks:', err);
        setError('Error fetching assigned tasks');
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  const handleStatusChange = (taskId, newStatus) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [taskId]: newStatus,
    }));
  };

  const handleStatusUpdate = async (taskId) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: status[taskId] });
      if (response.data.message === 'Task status updated successfully') {
        setMessage(`Task ${taskId} status updated successfully!`);
      } else {
        setMessage(`Failed to update task ${taskId} status.`);
      }
    } catch (err) {
      console.error('Error Updating Task Status:', err);
      setMessage(`Error updating task ${taskId} status.`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E05F00] border-t-transparent"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#E05F00]">My Assigned Tasks</h1>

      {message && (
        <div className="mb-6 p-4 bg-[#E05F00] bg-opacity-10 rounded-lg text-center text-[#E05F00] font-medium">
          {message}
        </div>
      )}

      {tasks.length > 0 ? (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02] border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
                  <div className="flex items-center gap-2">
                    {statusIcons[status[task.id]]}
                    <span className="text-sm font-medium text-gray-600">{status[task.id]}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{task.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="font-medium text-gray-800">{task.priority}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Assigned By</p>
                    <p className="font-medium text-gray-800">{task.created_by_username}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Start Date / Time</p>
                    <p className="font-medium text-gray-800">{task.start_date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">End Date / Time</p>
                    <p className="font-medium text-gray-800">{task.end_date}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <select
                    value={status[task.id] || ''}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E05F00] focus:border-[#E05F00] outline-none"
                  >
                    {VALID_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleStatusUpdate(task.id)}
                    className="w-full bg-[#E05F00] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#E05F00]"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No tasks assigned to you.</p>
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;