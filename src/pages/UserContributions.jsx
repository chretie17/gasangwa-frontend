import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { 
  Plus, 
  TreePine, 
  Calendar, 
  MapPin, 
  User, 
  TrendingUp, 
  Award, 
  Camera, 
  X, 
  Loader2,
  BarChart3,
  Activity,
  Target,
  CheckCircle2,
  Upload,
  Edit3
} from 'lucide-react';
import api from '../api';

const UserContributionsPage = () => {
  const [contributions, setContributions] = useState([]);
  const [treeSpecies, setTreeSpecies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contribution_type: 'Planting',
    action: '',
    tree_species_id: '',
    quantity: '',
    location: '',
    date: '',
    survival_rate: '',
    frequency: '',
    notes: '',
    picture: null,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalTreesPlanted: 0,
    avgSurvivalRate: 0,
    monthlyContributions: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const speciesResponse = await api.get('/tree-species');
        setTreeSpecies(speciesResponse.data);

        const userId = localStorage.getItem('id');
        if (userId) {
          const contributionsResponse = await api.get(`/contributions/user/${userId}`);
          const contributionsData = contributionsResponse.data;
          setContributions(contributionsData);
          
          // Calculate statistics
          calculateStats(contributionsData);
        } else {
          setErrorMessage('User not authenticated');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error loading data');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (contributionsData) => {
    const total = contributionsData.length;
    const treesPlanted = contributionsData
      .filter(c => c.contribution_type === 'Planting')
      .reduce((sum, c) => sum + parseInt(c.quantity || 0), 0);
    
    const survivalRates = contributionsData
      .filter(c => c.survival_rate && c.survival_rate > 0)
      .map(c => parseFloat(c.survival_rate));
    
    const avgSurvival = survivalRates.length > 0 
      ? survivalRates.reduce((sum, rate) => sum + rate, 0) / survivalRates.length 
      : 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyContribs = contributionsData.filter(c => {
      const contribDate = new Date(c.date);
      return contribDate.getMonth() === currentMonth && contribDate.getFullYear() === currentYear;
    }).length;

    setStats({
      totalContributions: total,
      totalTreesPlanted: treesPlanted,
      avgSurvivalRate: Math.round(avgSurvival),
      monthlyContributions: monthlyContribs
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      picture: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const userId = localStorage.getItem('id');
    if (!userId) {
      setErrorMessage('User not authenticated');
      setOpenSnackbar(true);
      setSubmitting(false);
      return;
    }

    if (!formData.action || !formData.tree_species_id || !formData.quantity || !formData.location || !formData.date) {
      setErrorMessage('Please fill in all required fields');
      setOpenSnackbar(true);
      setSubmitting(false);
      return;
    }

    try {
      const contributionData = new FormData();
      contributionData.append('user_id', userId);
      contributionData.append('contribution_type', formData.contribution_type);
      contributionData.append('action', formData.action);
      contributionData.append('tree_species_id', formData.tree_species_id);
      contributionData.append('quantity', formData.quantity);
      contributionData.append('location', formData.location);
      contributionData.append('date', formData.date);
     contributionData.append('status', 'pending');

      
      if (formData.survival_rate) contributionData.append('survival_rate', formData.survival_rate);
      if (formData.frequency) contributionData.append('frequency', formData.frequency);
      if (formData.notes) contributionData.append('notes', formData.notes);
      if (formData.picture) contributionData.append('picture', formData.picture);

      const response = await api.post('/contributions', contributionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.data) {
        const newContributions = [response.data.data, ...contributions];
        setContributions(newContributions);
        calculateStats(newContributions);
      }

      setFormData({
        contribution_type: 'Planting',
        action: '',
        tree_species_id: '',
        quantity: '',
        location: '',
        date: '',
        survival_rate: '',
        frequency: '',
        notes: '',
        picture: null,
        status:''
      });

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      setSuccessMessage('Contribution added successfully!');
      setOpenSnackbar(true);
      setShowForm(false);

    } catch (error) {
      console.error('Error adding contribution:', error);
      setErrorMessage(error.response?.data?.message || 'Error adding contribution');
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const getContributionTypeIcon = (type) => {
    switch (type) {
      case 'Planting': return <TreePine className="w-4 h-4 text-green-600" />;
      case 'Maintenance': return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'Monitoring': return <Activity className="w-4 h-4 text-purple-600" />;
      default: return <CheckCircle2 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getContributionTypeColor = (type) => {
    switch (type) {
      case 'Planting': return 'bg-green-100 text-green-800 border-green-200';
      case 'Maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Monitoring': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading your contributions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Community Contributions
              </h1>
              <p className="text-gray-600 text-lg">Track your environmental impact and contributions</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Contribution
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Contributions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContributions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Trees Planted</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalTreesPlanted}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Avg Survival Rate</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgSurvivalRate}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">This Month</p>
                <p className="text-3xl font-bold text-orange-600">{stats.monthlyContributions}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Contributions Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              Your Contributions
            </h2>
          </div>

          {contributions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {contributions.map((contribution) => (
                <div key={contribution.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getContributionTypeColor(contribution.contribution_type)}`}>
                      {getContributionTypeIcon(contribution.contribution_type)}
                      {contribution.contribution_type}
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">
                      {contribution.date}
                    </span>
                
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{contribution.action}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <TreePine className="w-4 h-4" />
                          {contribution.quantity} trees
                        </span>
                        {contribution.survival_rate && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {contribution.survival_rate}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {contribution.location}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {contribution.status}
                    </div>

                    {contribution.notes && (
                      <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                        {contribution.notes}
                      </p>
                    )}

                    {contribution.picture && (
                      <div className="mt-4">
                        <img 
                          src={`http://localhost:3000${contribution.picture}`} 
                          alt="Contribution" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-32 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <TreePine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No contributions yet</h3>
              <p className="text-gray-500 mb-6">Start making a difference by adding your first contribution!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Contribution
              </button>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-green-600" />
                    Log Your Contribution
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contribution Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contribution Type *
                    </label>
                    <select
                      name="contribution_type"
                      value={formData.contribution_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Planting">🌱 Planting</option>
                      <option value="Maintenance">🔧 Maintenance</option>
                      <option value="Monitoring">📊 Monitoring</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Action *
                    </label>
                    <input
                      type="text"
                      name="action"
                      value={formData.action}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Planted saplings, Watered trees"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Tree Species */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tree Species *
                    </label>
                    <select
                      name="tree_species_id"
                      value={formData.tree_species_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a species</option>
                      {treeSpecies.map((species) => (
                        <option key={species.id} value={species.id}>
                          {species.name} ({species.rwandan_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="Number of trees"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Kigali City, Sector X"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>


                  {/* Survival Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Survival Rate (%)
                    </label>
                    <input
                      type="number"
                      name="survival_rate"
                      value={formData.survival_rate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="Optional"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frequency
                    </label>
                    <input
                      type="text"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      placeholder="e.g., Weekly, Monthly"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Additional details about your contribution..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Picture Upload */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Picture
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors duration-200">
                    <input
                      type="file"
                      name="picture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="picture-upload"
                    />
                    <label htmlFor="picture-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Click to upload image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                    </label>
                    {formData.picture && (
                      <p className="text-green-600 text-sm mt-2 font-medium">
                        ✓ {formData.picture.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Contribution
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert severity={successMessage ? "success" : "error"} onClose={handleCloseSnackbar}>
            {successMessage || errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default UserContributionsPage;