import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'member' });
    const [editUser, setEditUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editUser) {
            setEditUser({ ...editUser, [name]: value });
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', newUser);
            setSuccess('User added successfully');
            setError('');
            setNewUser({ username: '', email: '', password: '', role: 'member' });
            fetchUsers();
        } catch (err) {
            setError('Error adding user');
            setSuccess('');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${editUser.id}`, {
                username: editUser.username,
                email: editUser.email,
                role: editUser.role,
            });
            setSuccess('User updated successfully');
            setError('');
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            setError('Error updating user');
            setSuccess('');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setSuccess('User deleted successfully');
                setError('');
                fetchUsers();
            } catch (err) {
                setError('Error deleting user');
                setSuccess('');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
                    
                    {/* Alerts */}
                    {success && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}
                </div>

                {/* User List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Existing Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Username</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{user.username}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                                  user.role === 'engineer' ? 'bg-blue-100 text-blue-800' : 
                                                  'bg-green-100 text-green-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-3">
                                            <button
                                                onClick={() => setEditUser(user)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit User Form */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        {editUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <form onSubmit={editUser ? handleEditUser : handleAddUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Enter username"
                                    value={editUser ? editUser.username : newUser.username}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={editUser ? editUser.email : newUser.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!editUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        value={newUser.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={editUser ? editUser.role : newUser.role}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none"
                                >
                                    <option value="member">Member</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            {editUser && (
                                <button
                                    type="button"
                                    onClick={() => setEditUser(null)}
                                    className="mr-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                {editUser ? 'Update User' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;