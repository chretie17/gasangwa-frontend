import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import Sidebar from './components/Sidebar';
import AdminProjectPage from './pages/Projects';
import TaskManagement from './pages/Tasks';
import AssignedProject from './pages/AssignedProject';
import AssignedTasks from './pages/YourTasks';
import PublicProjectTracking from './pages/PublicProject';
import ReportsPage from './pages/Reports';
import AdminTreeSpeciesPage from './pages/AdminTreeSpeciesPage';
import TreeSpeciesPage from './pages/CommunitySpecies';

// Layout component that includes the sidebar and main content
const Layout = ({ children }) => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex-1 p-6 ml-64"> {/* Ensure content doesn't overlap the sidebar */}
                {children}
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Default route redirects to login */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/public/project/:projectId" element={<PublicProjectTracking/>} />

                {/* Login page doesn't need the layout */}
                <Route path="/login" element={<LoginPage />} />

                {/* All other routes will use the Layout component */}
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/users" element={<Layout><ManageUsers /></Layout>} />
                <Route path="/projects" element={<Layout><AdminProjectPage /></Layout>} />
                <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
                <Route path="/tasks" element={<Layout><TaskManagement /></Layout>} />
                <Route path="/assignedproject" element={<Layout><AssignedProject /></Layout>} />
                <Route path="/assignedtask" element={<Layout><AssignedTasks /></Layout>} />
                <Route path="/admintreespecies" element={<Layout><AdminTreeSpeciesPage /></Layout>} />
                <Route path="/treespecies" element={<Layout><TreeSpeciesPage /></Layout>} />

            </Routes>
        </Router>
    );
};

export default App;
