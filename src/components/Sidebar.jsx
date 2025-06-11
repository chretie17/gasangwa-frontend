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
    Flag
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
            { path: '/assignedproject', label: 'Your Projects', icon: <FolderKanban /> },
            { path: '/assignedtask', label: 'Your Tasks', icon: <CheckSquare /> }
        ]
    };

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <motion.aside 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed top-0 left-0 w-64 h-full bg-gray-900 text-gray-100 shadow-lg flex flex-col"
        >
            {/* Profile Section */}
            <div className="p-6 border-b border-gray-800">
                <motion.div 
                    className="flex flex-col items-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-lg font-semibold">{userName}</h2>
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        {currentTime.toLocaleTimeString()}
                    </div>
                </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 overflow-y-auto">
                <ul className="space-y-2">
                    {links[role]?.map((link, index) => (
                        <motion.li
                            key={link.path}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={link.path}
                                className={`
                                    flex items-center px-4 py-3 rounded-lg transition-all duration-200
                                    ${location.pathname === link.path 
                                        ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white' 
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }
                                `}
                            >
                                <span className="w-5 h-5 mr-3">
                                    {link.icon}
                                </span>
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-800">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span className="font-medium">Logout</span>
                </motion.button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;