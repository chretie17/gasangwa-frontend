import React, { useEffect, useState } from 'react';
import api from '../api';
import { Plus, X, Edit, Trash2, Image, Users, Calendar, MapPin, DollarSign, FileText } from 'lucide-react';

// Custom Alert Component
const Alert = ({ children, onClose, severity = 'error' }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    severity === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'
  }`}>
    <div className="flex items-center justify-between">
      <span>{children}</span>
      <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Custom Modal Component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Custom Loading Component
const CircularProgress = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-200"></div>
);

const AdminProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: '',
    project_manager: '',
    location: '',
    assigned_user: '',
    images: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [projectImages, setProjectImages] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then((response) => {
        setProjects(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage('Error fetching projects');
        setOpenSnackbar(true);
        console.error('Error fetching projects:', error);
      });

    api.get('/projects/users')
      .then((response) => {
        setUsers(response.data || []);
      })
      .catch((error) => {
        setErrorMessage('Error fetching users');
        setOpenSnackbar(true);
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    setFormData({
      ...formData,
      images: Array.from(files),
    });
  };

  const handleUserChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      assigned_user: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const projectData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'images') {
        formData.images.forEach((image) => {
          projectData.append('images', image);
        });
      } else {
        projectData.append(key, formData[key]);
      }
    });
  
    if (isEditing) {
      api.put(`/projects/${editingProject.id}`, projectData)
        .then((response) => {
          alert('Project updated successfully');
          setProjects((prevProjects) =>
            prevProjects.map((project) =>
              project.id === editingProject.id ? { ...project, ...formData } : project
            )
          );
          resetForm();
        })
        .catch((error) => {
          setErrorMessage('Error updating project');
          setOpenSnackbar(true);
          console.error('Error updating project:', error);
        });
    } else {
      api.post('/projects', projectData)
        .then((response) => {
          alert('Project added successfully');
          setProjects([...projects, response.data]);
          resetForm();
        })
        .catch((error) => {
          setErrorMessage('Error adding project');
          setOpenSnackbar(true);
          console.error('Error adding project:', error);
        });
    }
  };
  
  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      budget: '',
      project_manager: '',
      location: '',
      assigned_user: '',
      images: [],
    });
    setIsEditing(false);
    setEditingProject(null);
    setShowForm(false);
  };

  const handleDelete = (projectId) => {
    api.delete(`/projects/${projectId}`)
      .then(() => {
        alert('Project deleted successfully');
        setProjects(projects.filter((project) => project.id !== projectId));
      })
      .catch((error) => {
        setErrorMessage('Error deleting project');
        setOpenSnackbar(true);
        console.error('Error deleting project:', error);
      });
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setEditingProject(project);
    setShowForm(true);
  
    // Format dates to YYYY-MM-DD
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
  
    setFormData({
      project_name: project.project_name || '',
      description: project.description || '',
      status: project.status || 'planning',
      start_date: formatDateForInput(project.start_date),
      end_date: formatDateForInput(project.end_date),
      budget: project.budget || '',
      project_manager: project.project_manager || '',
      location: project.location || '',
      assigned_user: project.assigned_user || '',
      images: [], // Keep the existing images array empty for the form
    });
  };

  const handleViewImages = (projectId) => {
    api.get(`/projects/${projectId}/images`)
      .then((response) => {
        setProjectImages(response.data.images || []);
        setOpenModal(true);
      })
      .catch((error) => {
        setErrorMessage('Error fetching project images');
        setOpenSnackbar(true);
        console.error('Error fetching project images:', error);
      });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProjectImages([]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleNewProject = () => {
    setIsEditing(false);
    setEditingProject(null);
    setFormData({
      project_name: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      budget: '',
      project_manager: '',
      location: '',
      assigned_user: '',
      images: [],
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-700 p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <CircularProgress className="mb-4 text-emerald-200" sx={{ color: '#a7f3d0' }} />
          <p className="text-emerald-100 text-lg font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700 mb-2">
                Project Management
              </h1>
              <p className="text-gray-600 text-lg font-medium">Manage and oversee all your projects efficiently</p>
            </div>
            <button
              onClick={handleNewProject}
              className="group relative bg-gradient-to-r from-emerald-600 to-green-700 text-white px-8 py-4 rounded-2xl hover:from-emerald-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 font-semibold"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              New Project
            </button>
          </div>
        </div>

        {/* Project Form - Animated Slide In */}
        {showForm && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-6 shadow-2xl border border-white/20 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700 flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600" />
                {isEditing ? 'Update Project' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 group"
              >
                <X className="w-6 h-6 text-gray-500 group-hover:text-red-500" />
              </button>
            </div>
            
            <div onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                {/* Location */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    placeholder="Project location"
                    required
                  />
                </div>

                {/* Start Date */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    required
                  />
                </div>

                {/* Budget */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Budget
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    placeholder="Project budget"
                    required
                  />
                </div>

                {/* Status */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    required
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300 resize-none"
                  placeholder="Enter project description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned User */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Assigned User
                  </label>
                  <select
                    name="assigned_user"
                    value={formData.assigned_user}
                    onChange={handleUserChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Images */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-600" />
                    Project Images
                  </label>
                  <input
                    type="file"
                    name="images"
                    onChange={handleFileChange}
                    multiple
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-300 bg-white hover:border-emerald-300"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 text-white p-4 rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
                >
                  {isEditing ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 sm:flex-none px-8 bg-gray-200 text-gray-700 p-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Table */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Projects Overview
            </h2>
            <p className="text-emerald-100 mt-2">Manage all your projects in one place</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-emerald-100">
                <tr>
                  <th className="p-4 text-left text-gray-700 font-semibold">Project Name</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Status</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Location</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Start Date</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">End Date</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Budget</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Assigned User</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <tr key={project.id} className={`border-b hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="p-4 font-medium text-gray-800">{project.project_name}</td>
                      <td className="p-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          project.status === 'delayed' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{project.location}</td>
                      <td className="p-4 text-gray-700">{project.start_date}</td>
                      <td className="p-4 text-gray-700">{project.end_date}</td>
                      <td className="p-4 text-gray-700 font-semibold">${project.budget}</td>
                      <td className="p-4 text-gray-700">{project.assigned_user}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewImages(project.id)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="View Images"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(project)}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-2 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <FileText className="w-16 h-16 text-gray-300" />
                        <p className="text-gray-500 text-lg font-medium">No projects found</p>
                        <p className="text-gray-400">Create your first project to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for images */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden m-4">
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <Image className="w-8 h-8" />
                  Project Gallery
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {projectImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Image className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No images available</p>
                  <p className="text-gray-400">This project doesn't have any images yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectImages.map((image, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <img 
                        src={image} 
                        alt={`Project Image ${index + 1}`} 
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Snackbar for error messages */}
        {openSnackbar && (
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="error"
          >
            {errorMessage}
          </Alert>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminProjectPage;