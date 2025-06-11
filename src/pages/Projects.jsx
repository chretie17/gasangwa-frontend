import React, { useEffect, useState } from 'react';
import api from '../api';
import { Snackbar, Alert, CircularProgress, Modal } from '@mui/material';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <CircularProgress className="mb-4" />
        <p className="text-gray-600 text-lg">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b-4 border-blue-500 pb-4">
          Admin Project Management
        </h1>

        {/* Project Form */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            {isEditing ? 'Update Project' : 'Add New Project'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleInputChange}
              placeholder="Project Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full p-3 border border-gray-300 rounded-lg col-span-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              required
            />
            <div className="space-y-4">
              <label className="block text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Budget"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
            <input
              type="file"
              name="images"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              multiple
            />
            <select
              name="assigned_user"
              value={formData.assigned_user}
              onChange={handleUserChange}
              className="w-full p-3 border border-gray-300 rounded-lg col-span-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              {isEditing ? 'Update Project' : 'Add Project'}
            </button>
          </form>
        </div>

        {/* Projects Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <h2 className="text-2xl font-semibold p-6 bg-gray-100 text-gray-700">Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4 text-left text-gray-600">Project Name</th>
                  <th className="p-4 text-left text-gray-600">Status</th>
                  <th className="p-4 text-left text-gray-600">Location</th>
                  <th className="p-4 text-left text-gray-600">Start Date</th>
                  <th className="p-4 text-left text-gray-600">End Date</th>
                  <th className="p-4 text-left text-gray-600">Budget</th>
                  <th className="p-4 text-left text-gray-600">Assigned User</th>
                  <th className="p-4 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50 transition duration-200">
                      <td className="p-4">{project.project_name}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'delayed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-4">{project.location}</td>
                      <td className="p-4">{project.start_date}</td>
                      <td className="p-4">{project.end_date}</td>
                      <td className="p-4">{project.budget}</td>
                      <td className="p-4">{project.assigned_user}</td>
                      <td className="p-4 space-x-2">
                        <button
                          onClick={() => handleViewImages(project.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition mr-2"
                        >
                          Images
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for images */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Project Images</h2>
            <div className="grid grid-cols-3 gap-6">
          
              {projectImages.length === 0 ? (
                <p className="col-span-3 text-center text-gray-500">No images available for this project</p>
              ) : (
                projectImages.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Project Image ${index}`} 
                    className="w-full h-48 object-cover rounded-lg shadow-md hover:scale-105 transition duration-300"
                  />
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseModal}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Snackbar for error messages */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="error" 
            className="bg-red-50 text-red-900 font-medium"
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default AdminProjectPage;