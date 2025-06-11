// Pages/AdminTreeSpeciesPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Snackbar, Alert, CircularProgress } from '@mui/material';

const AdminTreeSpeciesPage = () => {
  const [species, setSpecies] = useState([]);
  const [formData, setFormData] = useState({ name: '', native: false, carbon_rate: '', soil_type: '', notes: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setFormData({ name: '', native: false, carbon_rate: '', soil_type: '', notes: '' });
      setIsEditing(false);
      setEditingId(null);
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
    });
    setIsEditing(true);
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this species?')) return;
    api.delete(`/tree-species/${id}`).then(() => fetchSpecies());
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Tree Species Management</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
        <input name="carbon_rate" value={formData.carbon_rate} onChange={handleChange} placeholder="Carbon Rate (kg/year)" className="border p-2 rounded" type="number" />
        <input name="soil_type" value={formData.soil_type} onChange={handleChange} placeholder="Soil Type" className="border p-2 rounded" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="native" checked={formData.native} onChange={handleChange} />
          <span>Native?</span>
        </label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="col-span-2 border p-2 rounded" rows={3} />
        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded">
          {isEditing ? 'Update Species' : 'Add Species'}
        </button>
      </form>

      {loading ? <CircularProgress /> : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Native</th>
              <th className="p-2 border">Carbon Rate</th>
              <th className="p-2 border">Soil Type</th>
              <th className="p-2 border">Notes</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {species.map((item) => (
              <tr key={item.id}>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.native ? 'Yes' : 'No'}</td>
                <td className="p-2 border">{item.carbon_rate}</td>
                <td className="p-2 border">{item.soil_type}</td>
                <td className="p-2 border">{item.notes}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar}>{errorMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default AdminTreeSpeciesPage;
