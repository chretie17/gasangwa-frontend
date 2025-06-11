import React, { useEffect, useState } from 'react';
import api from '../api';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import { Plus, Edit, Trash2, TreePine, Leaf, Camera, X, Check, AlertCircle } from 'lucide-react';

const AdminTreeSpeciesPage = () => {
  const [species, setSpecies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    native: false,
    carbon_rate: '',
    soil_type: '',
    notes: '',
    image_url: '',
    growth_conditions: '',
    common_uses: '',
    planting_season: '',
    soil_improvement: '',
    environmental_impact: '',
    rwandan_name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = () => {
    api.get('/tree-species')
      .then((res) => {
        setSpecies(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage('Failed to load tree species');
        setOpenSnackbar(true);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = isEditing ? api.put(`/tree-species/${editingId}`, formData) : api.post('/tree-species', formData);

    request.then(() => {
      fetchSpecies();
      setFormData({
        name: '',
        native: false,
        carbon_rate: '',
        soil_type: '',
        notes: '',
        image_url: '',
        growth_conditions: '',
        common_uses: '',
        planting_season: '',
        soil_improvement: '',
        environmental_impact: '',
        rwandan_name: ''
      });
      setIsEditing(false);
      setEditingId(null);
      setShowForm(false);
    }).catch(() => {
      setErrorMessage('Failed to save tree species');
      setOpenSnackbar(true);
    });
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      native: item.native,
      carbon_rate: item.carbon_rate,
      soil_type: item.soil_type,
      notes: item.notes,
      image_url: item.image_path,
      growth_conditions: item.growth_conditions,
      common_uses: item.common_uses,
      planting_season: item.planting_season,
      soil_improvement: item.soil_improvement,
      environmental_impact: item.environmental_impact,
      rwandan_name: item.rwandan_name || ''
    });
    setIsEditing(true);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this species?')) return;
    api.delete(`/tree-species/${id}`).then(() => fetchSpecies());
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const resetForm = () => {
    setFormData({
      name: '',
      native: false,
      carbon_rate: '',
      soil_type: '',
      notes: '',
      image_url: '',
      growth_conditions: '',
      common_uses: '',
      planting_season: '',
      soil_improvement: '',
      environmental_impact: '',
      rwandan_name: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-l-8 border-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-700 p-3 rounded-xl">
                <TreePine className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-800">Tree Species Management</h1>
                <p className="text-green-600 mt-1">Manage and monitor tree species for sustainable forestry</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{showForm ? 'Cancel' : 'Add New Species'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-l-8 border-green-600">
            <div className="flex items-center space-x-3 mb-6">
              <Leaf className="w-6 h-6 text-green-700" />
              <h2 className="text-2xl font-bold text-green-800">
                {isEditing ? 'Edit Tree Species' : 'Add New Tree Species'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Tree Species Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    required
                    placeholder="Enter species name"
                  />
                </div>

                {/* Carbon Rate */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Carbon Rate (kg/year)
                  </label>
                  <input
                    name="carbon_rate"
                    value={formData.carbon_rate}
                    onChange={handleChange}
                    type="number"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Enter carbon absorption rate"
                  />
                </div>

                {/* Soil Type */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Soil Type
                  </label>
                  <input
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Preferred soil type"
                  />
                </div>

                {/* Rwandan Name */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Rwandan Name
                  </label>
                  <input
                    name="rwandan_name"
                    value={formData.rwandan_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Local name (optional)"
                  />
                </div>
              </div>

              {/* Native Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="native"
                  checked={formData.native}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-2 border-green-300 rounded focus:ring-green-500"
                />
                <label className="text-sm font-semibold text-green-800">
                  Native Species
                </label>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2 flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Image URL</span>
                </label>
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Enter image URL (optional)"
                />
              </div>

              {/* Large text fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Growth Conditions
                  </label>
                  <textarea
                    name="growth_conditions"
                    value={formData.growth_conditions}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                    placeholder="Optimal growing conditions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Common Uses
                  </label>
                  <textarea
                    name="common_uses"
                    value={formData.common_uses}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                    placeholder="How this species is commonly used"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Planting Season
                  </label>
                  <input
                    name="planting_season"
                    value={formData.planting_season}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Best time to plant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Soil Improvement
                  </label>
                  <textarea
                    name="soil_improvement"
                    value={formData.soil_improvement}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                    placeholder="How it improves soil quality"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Environmental Impact
                </label>
                <textarea
                  name="environmental_impact"
                  value={formData.environmental_impact}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Environmental benefits and impacts"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Additional notes or observations"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Check className="w-5 h-5" />
                  <span>{isEditing ? 'Update Species' : 'Add Species'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Species List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 border-green-600">
          <div className="bg-green-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <TreePine className="w-6 h-6" />
              <span>Species Database ({species.length} species)</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress style={{ color: '#15803d' }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {species.map((item) => (
                <div key={item.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-green-100 hover:border-green-300">
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {item.image_path ? (
                      <img
                        src={item.image_path}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-green-100 flex items-center justify-center" style={{display: item.image_path ? 'none' : 'flex'}}>
                      <TreePine className="w-16 h-16 text-green-400" />
                    </div>
                    <div className="absolute top-3 right-3">
                      {item.native ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Leaf className="w-3 h-3" />
                          <span>Native</span>
                        </span>
                      ) : (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Introduced
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-green-800">{item.name}</h3>
                    </div>
                    
                    {item.rwandan_name && (
                      <p className="text-green-600 font-medium mb-3 italic">"{item.rwandan_name}"</p>
                    )}

                    <div className="space-y-2 text-sm">
                      {item.carbon_rate && (
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-700">Carbon Rate:</span>
                          <span className="text-green-600">{item.carbon_rate} kg/year</span>
                        </div>
                      )}
                      {item.soil_type && (
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-700">Soil:</span>
                          <span className="text-green-600">{item.soil_type}</span>
                        </div>
                      )}
                      {item.planting_season && (
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-700">Season:</span>
                          <span className="text-green-600">{item.planting_season}</span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">{item.notes}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {species.length === 0 && !loading && (
            <div className="text-center py-12">
              <TreePine className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-green-600 text-lg">No tree species found. Add your first species to get started!</p>
            </div>
          )}
        </div>
      </div>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar} className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminTreeSpeciesPage;