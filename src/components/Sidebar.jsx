import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Users, 
    FolderKanban, 
    CheckSquare, 
    LogOut,
    Clock,
    Flag,
    TreeDeciduous,
    Leaf
} from 'lucide-react';

const Sidebar = () => {
    const role = localStorage.getItem('role') || 'member';
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserName(userData.username || 'User');
        }

        return () => clearInterval(timer);
    }, []);

    const links = {
        admin: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
            { path: '/users', label: 'Manage Users', icon: <Users /> },
            { path: '/projects', label: 'Projects', icon: <FolderKanban /> },
            { path: '/admintreespecies', label: 'Tree Species', icon: <TreeDeciduous /> },
            { path: '/tasks', label: 'Tasks', icon: <CheckSquare /> },
            { path: '/reports', label: 'Reports', icon: <Flag /> }
        ],
        engineer: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
            { path: '/projects', label: 'Projects', icon: <FolderKanban /> },
            { path: '/tasks', label: 'Tasks', icon: <CheckSquare /> }
        ],
        member: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
            { path: '/treespecies', label: 'Tree Species', icon: <TreeDeciduous /> },
            { path: '/assignedproject', label: 'Your Projects', icon: <FolderKanban /> },
            { path: '/assignedtask', label: 'Your Tasks', icon: <CheckSquare /> }
        ]
    };

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const containerVariants = {
        hidden: { x: -300, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { x: -50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        }
    };

    return (
        <motion.aside 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="fixed top-0 left-0 w-72 h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 backdrop-blur-xl shadow-2xl border-r border-emerald-500/20 flex flex-col overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(0, 13, 10, 0.95) 0%, rgba(2, 73, 67, 0.95) 50%, rgba(1, 21, 8, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(52, 211, 153, 0.2)'
            }}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Header with Brand */}
            <motion.div 
                variants={itemVariants}
                className="relative p-6 border-b border-emerald-500/20"
            >
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">RLRMT</h1>
                        <p className="text-emerald-200 text-xs">Reforestation Platform</p>
                    </div>
                </div>
            </motion.div>

            {/* Profile Section */}
            <motion.div 
                variants={itemVariants}
                className="relative p-6 border-b border-emerald-500/20"
            >
                <div className="flex flex-col items-center text-center">
                    <motion.div 
                        className="relative mb-4"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-green-400 p-0.5 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-emerald-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </motion.div>
                    <h2 className="text-white font-semibold text-lg mb-1">{userName}</h2>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-500/30 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-emerald-200 text-sm font-medium capitalize">{role}</span>
                    </div>
                    <div className="flex items-center mt-3 px-3 py-2 rounded-lg bg-emerald-800/30 border border-emerald-500/20 backdrop-blur-sm">
                        <Clock className="w-4 h-4 mr-2 text-emerald-300" />
                        <span className="text-emerald-100 text-sm font-mono">
                            {currentTime.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Navigation */}
            <motion.nav 
                variants={itemVariants}
                className="flex-1 py-6 px-4 overflow-y-auto relative"
            >
                <div className="space-y-2">
                    {links[role]?.map((link, index) => (
                        <motion.div
                            key={link.path}
                            variants={itemVariants}
                            custom={index}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <Link
                                to={link.path}
                                className={`
                                    group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden
                                    ${location.pathname === link.path 
                                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-400/30 shadow-lg' 
                                        : 'text-emerald-100 hover:bg-emerald-800/30 hover:text-white border border-transparent hover:border-emerald-500/20'
                                    }
                                `}
                            >
                                {/* Active indicator */}
                                {location.pathname === link.path && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                
                                {/* Icon container */}
                                <div 
                                    className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-300
                                        ${location.pathname === link.path 
                                            ? 'bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-lg' 
                                            : 'bg-emerald-800/40 text-emerald-300 group-hover:bg-emerald-700/60 group-hover:text-white'
                                        }
                                    `}
                                >
                                    {React.cloneElement(link.icon, { className: "w-5 h-5" })}
                                </div>
                                
                                {/* Label */}
                                <span className="font-medium text-sm flex-1">{link.label}</span>
                                
                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/5 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.nav>

            {/* Logout Button */}
            <motion.div 
                variants={itemVariants}
                className="p-4 border-t border-emerald-500/20 relative"
            >
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full px-4 py-3.5 flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 shadow-lg border border-red-400/30 backdrop-blur-sm group"
                >
                    <LogOut className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">Logout</span>
                    
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </motion.button>
            </motion.div>

            {/* Bottom decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400"></div>
        </motion.aside>
    );
};

export default Sidebar;