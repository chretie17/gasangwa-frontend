import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import picture from '../assets/const.jpg'

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/login', { identifier, password });
            const { user } = response.data;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('username', user.username);
            localStorage.setItem('role', user.role);
            localStorage.setItem('id', user.id);

            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username/email or password');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Background image with overlay */}
            <div className="absolute inset-0">
                <img 
                    src={picture} 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 to-gray-900/60 backdrop-blur-sm"></div>
            </div>

            {/* Content */}
            <div className="w-full max-w-md relative z-10 px-4 py-12">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
                    {/* Logo/Icon with animation */}
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center transform hover:scale-105 transition-all duration-300 shadow-lg">
                        <svg 
                            className="w-10 h-10 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>

                    {/* Header with enhanced typography */}
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-bold text-gray-800 tracking-tight">Welcome back</h2>
                        <p className="text-gray-600">Please sign in to your account</p>
                    </div>

                    {/* Enhanced Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Username or Email"
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Enhanced Footer */}
                    <div className="text-center space-y-4">
                        <a href="#" className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center space-x-1 group">
                            <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;