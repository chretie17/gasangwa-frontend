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
        <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-emerald-950 via-green-900 to-slate-900">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-32 right-20 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                <div className="absolute bottom-20 left-32 w-36 h-36 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>

            {/* Background image with overlay */}
            <div className="absolute inset-0">
                <img 
                    src={picture} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-green-800/70 to-slate-900/80"></div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-green-300 rounded-full opacity-60 animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="w-full max-w-md relative z-10 px-4 py-12">
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-green-500/20 relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    
                    {/* Logo/Icon with tree animation */}
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-500 shadow-xl shadow-green-500/30 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-emerald-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <svg 
                            className="w-12 h-12 text-white relative z-10 transform group-hover:rotate-12 transition-transform duration-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M12 3v1m0 12v1m8-6h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 2.5a4.5 4.5 0 00-4.5 4.5v3a4.5 4.5 0 009 0V7A4.5 4.5 0 0012 2.5z"
                            />
                        </svg>
                    </div>

                    {/* Header with enhanced typography */}
                    <div className="text-center space-y-3 relative z-10">
                        <h1 className="text-2xl font-bold text-green-400 tracking-wider uppercase">RLRMT</h1>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-gray-300">Restoring our planet, one tree at a time</p>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto"></div>
                    </div>

                    {/* Enhanced Form */}
                    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <input
                                    type="text"
                                    placeholder="Username or Email"
                                    className="w-full px-4 py-4 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-green-400 focus:bg-slate-700/70 focus:ring-2 focus:ring-green-400/30 transition-all duration-300 outline-none text-white placeholder-gray-400 relative z-10"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-4 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-green-400 focus:bg-slate-700/70 focus:ring-2 focus:ring-green-400/30 transition-all duration-300 outline-none text-white placeholder-gray-400 relative z-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/50 text-red-300 p-4 rounded-xl text-sm font-medium border border-red-500/30 flex items-center space-x-2 backdrop-blur-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-400 text-white rounded-xl transition-all duration-500 font-semibold shadow-xl shadow-green-500/30 hover:shadow-green-400/40 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative z-10">Sign In & Plant Change</span>
                        </button>
                    </form>

                    {/* Enhanced Footer */}
                    <div className="text-center space-y-4 relative z-10">
                        <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Sustainable. Accountable. Impactful.</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <a href="#" className="text-green-400 hover:text-green-300 font-medium inline-flex items-center space-x-2 group transition-colors duration-300">
                            <span>Forgot Password?</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Bottom tagline */}
                <div className="text-center mt-8">
                    <p className="text-green-300/80 text-sm font-light tracking-wide">
                        Every login helps track our collective impact on Earth's restoration
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;