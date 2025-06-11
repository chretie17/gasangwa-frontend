import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpCircle, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const PublicProjectTracking = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Status icons mapping
  const statusIcons = {
    'planning': <Clock className="w-6 h-6 text-[#4A90E2]" />,
    'in_progress': <ArrowUpCircle className="w-6 h-6 text-[#4A90E2]" />,
    'completed': <CheckCircle2 className="w-6 h-6 text-green-500" />,
    'delayed': <AlertCircle className="w-6 h-6 text-red-500" />
  };

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/public/project/${projectId}`);
        setProject(response.data);
      } catch (err) {
        setError('Error fetching project details');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // Image carousel navigation
  const handleNextImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % project.images.length
      );
    }
  };

  const handlePrevImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.images.length - 1 : prev - 1
      );
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      
      // Validate date
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // Detailed date formatting
      const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Calculate days difference
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Prepare status text
      let statusText = '';
      if (diffDays > 0) {
        statusText = `${Math.abs(diffDays)} days from now`;
      } else if (diffDays < 0) {
        statusText = `${Math.abs(diffDays)} days ago`;
      } else {
        statusText = 'Today';
      }

      return {
        full: formatter.format(date),
        status: statusText
      };
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E8F0F7]">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-[#4A90E2] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFE5E5] to-[#FFF5F5]">
        <div className="bg-white shadow-2xl p-8 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Project Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Ensure project is not null before rendering
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E8F0F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#4A90E2] text-white p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center">
            {project.project_name}
          </h1>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              {statusIcons[project.status]}
              <span className="text-sm font-medium capitalize">
                {project.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Project Description */}
          <div className="bg-gray-50 p-5 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Project Overview
            </h2>
            <p className="text-gray-600">{project.description}</p>
          </div>

          {/* Image Carousel */}
          {project.images && project.images.length > 0 && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={project.images[currentImageIndex]}
                  alt={`Project image ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {/* Carousel Navigation */}
              {project.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/75 p-2 rounded-full transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/75 p-2 rounded-full transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {project.images.length}
              </div>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const projectDetails = [
                { 
                  label: 'Budget', 
                  value: `RWF ${project.budget}`, 
                  icon: '💰' 
                },
                { 
                  label: 'Location', 
                  value: project.location, 
                  icon: '📍' 
                },
                { 
                  label: 'Assigned User', 
                  value: project.assigned_user, 
                  icon: '👤' 
                },
                { 
                  label: 'Start Date', 
                  value: formatDate(project.start_date),
                  icon: '🗓️' 
                },
                { 
                  label: 'End Date', 
                  value: formatDate(project.end_date),
                  icon: '🏁' 
                }
              ];

              return projectDetails.map((detail, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 p-4 rounded-xl flex items-center gap-4"
                >
                  <div className="text-3xl">{detail.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {detail.label}
                    </p>
                    {typeof detail.value === 'object' ? (
                      <>
                        <p className="font-semibold text-gray-800">
                          {detail.value.full}
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          {detail.value.status}
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold text-gray-800">
                        {detail.value}
                      </p>
                    )}
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectTracking;