import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle, CheckCircle2, ArrowUpCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import api from '../api';

const AssignedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState({});
  const [images, setImages] = useState({});
  const [previews, setPreviews] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('id');

  const statusIcons = {
    'planning': <Clock className="w-5 h-5 text-[#E05F00]" />,
    'in_progress': <ArrowUpCircle className="w-5 h-5 text-[#E05F00]" />,
    'completed': <CheckCircle2 className="w-5 h-5 text-[#E05F00]" />,
    'delayed': <AlertCircle className="w-5 h-5 text-[#E05F00]" />
  };

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const fetchProjects = async () => {
    if (!userId) {
      setError('User ID not found in localStorage');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/project/assigned/${userId}`);
      setProjects(response.data);
      const statusMap = {};
      response.data.forEach((project) => {
        statusMap[project.id] = project.status;
      });
      setStatus(statusMap);
      setLoading(false);
    } catch (err) {
      console.error('Error Fetching Assigned Projects:', err);
      setError('Error fetching assigned projects');
      setLoading(false);
    }
  };

  const handleStatusChange = (projectId, newStatus) => {
    setStatus(prev => ({
      ...prev,
      [projectId]: newStatus,
    }));
  };

  const handleFileChange = (projectId, files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = Array.from(files).filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      setMessage('Only image files (JPEG, PNG, GIF, WEBP) are allowed');
      return;
    }

    setImages(prev => ({
      ...prev,
      [projectId]: validFiles,
    }));

    const imagesPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => ({
      ...prev,
      [projectId]: imagesPreviews,
    }));
  };

  const removePreview = (projectId, index) => {
    setPreviews(prev => ({
      ...prev,
      [projectId]: prev[projectId].filter((_, i) => i !== index),
    }));

    setImages(prev => ({
      ...prev,
      [projectId]: Array.from(prev[projectId]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e, projectId) => {
    e.preventDefault();
    if (!status[projectId]) {
      setMessage(`Status is required for project ${projectId}.`);
      return;
    }

    const formData = new FormData();
    formData.append('status', status[projectId]);
    formData.append('project_id', projectId);

    if (images[projectId]) {
      Array.from(images[projectId]).forEach(image => {
        formData.append('images', image);
      });
    }

    try {
      const response = await api.put(`/project/assigned/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data.message === 'Project updated successfully') {
        setMessage(`Project ${projectId} updated successfully!`);
        await fetchProjects();
        setImages(prev => ({ ...prev, [projectId]: [] }));
        setPreviews(prev => ({ ...prev, [projectId]: [] }));
      } else {
        setMessage(`Failed to update project ${projectId}.`);
      }
    } catch (err) {
      console.error('Error Submitting Form:', err);
      setMessage(`Error updating project ${projectId}.`);
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#E05F00]">Assigned Projects</h1>

      {message && (
        <div className="mb-6 p-4 bg-[#E05F00] bg-opacity-10 rounded-lg text-center text-[#E05F00] font-medium">
          {message}
        </div>
      )}

      {projects.length > 0 ? (
        <div className="grid gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{project.project_name}</h2>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                    {statusIcons[status[project.id]]}
                    <span className="text-sm font-medium capitalize">{status[project.id]?.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-bold text-[#E05F00]">RWF{project.budget}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{project.location}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Assigned User</p>
                    <p className="font-medium text-gray-800">{project.assigned_user}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#E05F00]" />
                    Project Images
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {project.images && project.images.length > 0 ? (
                      project.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Project ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                      ))
                    ) : (
                      <p className="col-span-full text-gray-500 text-center py-4">No images available</p>
                    )}
                  </div>
                </div>

                <form onSubmit={(e) => handleSubmit(e, project.id)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <select
                      value={status[project.id] || ''}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E05F00] focus:border-[#E05F00] outline-none"
                      required
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-gray-200 border-dashed cursor-pointer hover:bg-gray-100">
                        <Upload className="w-8 h-8 text-[#E05F00] mb-2" />
                        <span className="text-sm text-gray-500">Click to upload images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileChange(project.id, e.target.files)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image Previews */}
                    {previews[project.id] && previews[project.id].length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previews[project.id].map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Upload Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePreview(project.id, index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E05F00] text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#E05F00]"
                  >
                    Update Project
                  </button>
                </form>
              </div>
            </div>
          ))
}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No assigned projects.</p>
        </div>
      )}
    </div>
  );
};

export default AssignedProjects;