import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TreePine, 
  Calendar, 
  MapPin, 
  Award, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Filter,
  Search,
  Crown,
  Medal,
  Trophy,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Gift,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Image,
  FileText,
  Zap,
  Target,
  Leaf
} from 'lucide-react';
import jsPDF from 'jspdf';
import Coat from '../assets/coat.png';

const AdminContributionsPage = () => {
  const [contributions, setContributions] = useState([]);
  const [users, setUsers] = useState([]);
  const [treeSpecies, setTreeSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [topContributors, setTopContributors] = useState([]);
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalTreesPlanted: 0,
    totalUsers: 0,
    thisMonthContributions: 0
  });
// Add this function after all the useState declarations
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Real API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create an api object if it doesn't exist
        const apiBase = 'http://localhost:3000/api'; // Adjust to your backend URL
        
        // Fetch all contributions with user data
        const contributionsResponse = await fetch(`${apiBase}/contributions/all`);
        const contributionsData = await contributionsResponse.json();
        
        // Fetch users data
        const usersResponse = await fetch(`${apiBase}/users`);
        const usersData = await usersResponse.json();
        
        // Fetch tree species
        const speciesResponse = await fetch(`${apiBase}/tree-species`);
        const speciesData = await speciesResponse.json();
        
        // Process contributions data to include user and species info
        const processedContributions = contributionsData.map(contribution => {
          const user = usersData.find(u => u.id === contribution.user_id);
          const species = speciesData.find(s => s.id === contribution.tree_species_id);
          return {
            ...contribution,
            user_name: user ? `${user.username}` : 'Unknown User',
            user_email: user ? user.email : 'N/A',
            tree_species: species ? species.name : 'Unknown Species',
            status: contribution.status || 'pending' // Add status if not present
          };
        });
        
        // Calculate top contributors
        const userContributions = {};
        processedContributions.forEach(contribution => {
          if (!userContributions[contribution.user_id]) {
            userContributions[contribution.user_id] = {
              id: contribution.user_id,
              name: contribution.user_name,
              total_trees: 0,
              total_contributions: 0,
              last_contribution: formatDate(contribution.date) || contribution.date
            };
          }
          userContributions[contribution.user_id].total_trees += contribution.quantity;
          userContributions[contribution.user_id].total_contributions += 1;
          if (contribution.date > userContributions[contribution.user_id].last_contribution) {
            userContributions[contribution.user_id].last_contribution = contribution.date;
          }
        });
        
        const topContributorsArray = Object.values(userContributions)
          .sort((a, b) => b.total_trees - a.total_trees)
          .map((contributor, index) => ({ ...contributor, rank: index + 1 }))
          .slice(0, 10);
        
        // Calculate stats
// Calculate stats

const currentMonth = new Date().toISOString().slice(0, 7);
const thisMonthContributions = processedContributions.filter(c => 
  c.date && c.date.startsWith(currentMonth)
).length;
        
        setContributions(processedContributions);
        setTopContributors(topContributorsArray);
        setUsers(usersData);
        setTreeSpecies(speciesData);
        setStats({
          totalContributions: processedContributions.length,
          totalTreesPlanted: processedContributions.reduce((sum, c) => sum + (c.quantity || 0), 0),
          totalUsers: usersData.length,
          thisMonthContributions: thisMonthContributions
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewContribution = (contribution) => {
    setSelectedContribution(contribution);
    setShowModal(true);
  };

  const handleStatusChange = async (contributionId, newStatus) => {
    try {
      const apiBase = 'http://localhost:3000/api';
      const response = await fetch(`${apiBase}/contributions/${contributionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setContributions(prev => 
          prev.map(c => c.id === contributionId ? { ...c, status: newStatus } : c)
        );
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = contribution.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contribution.contribution_type === filterType;
    const matchesDate = !filterDate || contribution.date === filterDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Trophy className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || badges.pending;
  };
const generateCertificate = async (contributor) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Clean white background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Professional border - single elegant frame
  pdf.setDrawColor(27, 94, 32); // Dark green
  pdf.setLineWidth(2);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);
  
  // Inner accent line
  pdf.setDrawColor(184, 134, 11); // Gold accent
  pdf.setLineWidth(0.5);
  pdf.rect(20, 20, pageWidth - 40, pageHeight - 40);

  // Header section with institution name
  pdf.setFontSize(16);
  pdf.setTextColor(27, 94, 32);
  pdf.setFont('times', 'normal');
  pdf.text('Rwanda Environment Management Authority', pageWidth / 2, 35, { align: 'center' });
  
  // Decorative line under header
  pdf.setDrawColor(184, 134, 11);
  pdf.setLineWidth(1);
  pdf.line(pageWidth / 2 - 80, 40, pageWidth / 2 + 80, 40);

  // Main title
  pdf.setFontSize(42);
  pdf.setTextColor(27, 94, 32);
  pdf.setFont('times', 'bold');
  pdf.text('CERTIFICATE', pageWidth / 2, 65, { align: 'center' });
  
  pdf.setFontSize(28);
  pdf.setFont('times', 'normal');
  pdf.text('OF ACHIEVEMENT', pageWidth / 2, 78, { align: 'center' });

  // Presentation text
  pdf.setFontSize(16);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('times', 'normal');
  pdf.text('This is to certify that', pageWidth / 2, 100, { align: 'center' });

  // Recipient name with elegant underline
  pdf.setFontSize(32);
  pdf.setTextColor(27, 94, 32);
  pdf.setFont('times', 'bold');
  const recipientName = contributor.name;
  pdf.text(recipientName, pageWidth / 2, 120, { align: 'center' });

  // Professional underline
  const nameWidth = pdf.getTextWidth(recipientName) * (32/12);
  pdf.setDrawColor(184, 134, 11);
  pdf.setLineWidth(1.5);
  pdf.line(pageWidth / 2 - nameWidth / 2 - 10, 128, pageWidth / 2 + nameWidth / 2 + 10, 128);

  // Achievement description
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('times', 'normal');
  
  const achievementText = `has demonstrated exceptional commitment to environmental conservation through ${contributor.total_contributions} meaningful contributions, successfully facilitating the growth of ${contributor.total_trees} trees, making a significant positive impact for our planet's sustainable future.`;
  
  const lines = pdf.splitTextToSize(achievementText, pageWidth - 80);
  let currentY = 145;
  
  lines.forEach((line) => {
    pdf.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
  });

  // Date section
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('times', 'italic');
  pdf.text(`Awarded this ${currentDate}`, pageWidth / 2, currentY + 15, { align: 'center' });

  // Signature section - moved to right side and positioned lower
  const signatureY = pageHeight - 39;
  const signatureX = pageWidth - 120; // Right side positioning
  
  // Signature line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(1);
  pdf.line(signatureX, signatureY, signatureX + 80, signatureY);
  
  // Official seal positioned around signature - moved lower
  const sealX = signatureX - 15;
  const sealY = signatureY - -15;
  
 
 
  
  // Seal text
 try {
  pdf.setGState(pdf.GState({ opacity: 0.6 })); // Set opacity to 60%
  const sealSize = 15; // Adjust size as needed
  pdf.addImage(Coat, 'PNG', sealX - 20, sealY - 20, sealSize, sealSize);
  pdf.setGState(pdf.GState({ opacity: 1.0 })); // Reset opacity back to normal
} catch (error) {
  console.warn('Could not load coat image:', error);
}
  
  // Signature details
  pdf.setFontSize(12);
  pdf.setTextColor(27, 94, 32);
  pdf.setFont('times', 'bold');
  pdf.text('Juliet Kabera', signatureX + 40, signatureY + 8, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('times', 'normal');
  pdf.text('Director General, REMA', signatureX + 40, signatureY + 16, { align: 'center' });

  // Certificate number (professional touch)
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  const certNumber = `Certificate No: ECI-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  pdf.text(certNumber, 25, pageHeight - 25, { align: 'left' });

  // Save with clean filename
  const cleanName = contributor.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const timestamp = new Date().toISOString().slice(0, 10);
  pdf.save(`${cleanName}_Certificate_${timestamp}.pdf`);
};
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TreePine className="w-8 h-8 text-green-600" />
                Community Contributions Admin
              </h1>
              <p className="text-gray-600 mt-1">Manage and reward community tree planting efforts</p>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contributions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContributions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trees Planted</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalTreesPlanted}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-orange-600">{stats.thisMonthContributions}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'contributions', label: 'All Contributions', icon: FileText },
                { id: 'leaderboard', label: 'Top Contributors', icon: Award },
                { id: 'rewards', label: 'Rewards & Recognition', icon: Gift }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {contributions.slice(0, 3).map(contribution => (
                        <div key={contribution.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="bg-green-100 p-2 rounded-full">
                            <TreePine className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{contribution.user_name}</p>
                            <p className="text-xs text-gray-600">{contribution.action}</p>
                            <p className="text-xs text-gray-500">{contribution.quantity} trees • {contribution.location}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(contribution.status)}`}>
                            {contribution.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Verification Rate</span>
                        <span className="text-sm font-semibold text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Trees per Contribution</span>
                        <span className="text-sm font-semibold text-blue-600">45</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Growth</span>
                        <span className="text-sm font-semibold text-purple-600">+23%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Contributions Tab */}
            {activeTab === 'contributions' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search contributions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="Planting">Planting</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Monitoring">Monitoring</option>
                    </select>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contributions Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContributions.map((contribution) => (
                          <tr key={contribution.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {contribution.user_name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{contribution.user_name}</div>
                                  <div className="text-sm text-gray-500">{contribution.user_email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                contribution.contribution_type === 'Planting' ? 'bg-green-100 text-green-800' :
                                contribution.contribution_type === 'Maintenance' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {contribution.contribution_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{contribution.action}</div>
                              <div className="text-sm text-gray-500">{contribution.tree_species}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-1">
                                <TreePine className="w-4 h-4 text-green-600" />
                                {contribution.quantity}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm text-gray-900">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {contribution.location}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {formatDate(contribution.date)}
</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(contribution.status)}`}>
                                {contribution.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {contribution.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {contribution.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {contribution.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewContribution(contribution)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {contribution.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(contribution.id, 'verified')}
                                      className="text-green-600 hover:text-green-900 transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(contribution.id, 'rejected')}
                                      className="text-red-600 hover:text-red-900 transition-colors"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top 3 Podium */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Top Contributors
                    </h3>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                      <div className="flex justify-center items-end gap-4 mb-6">
                        {/* 2nd Place */}
                        {topContributors[1] && (
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-gray-400 to-gray-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                              2
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-lg">
                              <p className="font-semibold text-sm">{topContributors[1].name}</p>
                              <p className="text-xs text-gray-600">{topContributors[1].total_trees} trees</p>
                            </div>
                          </div>
                        )}
                        
                        {/* 1st Place */}
                        {topContributors[0] && (
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                              1
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-yellow-400">
                              <p className="font-bold text-sm">{topContributors[0].name}</p>
                              <p className="text-xs text-gray-600">{topContributors[0].total_trees} trees</p>
                            </div>
                          </div>
                        )}
                        
                        {/* 3rd Place */}
                        {topContributors[2] && (
                          <div className="text-center">
                            <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                              3
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-lg">
                              <p className="font-semibold text-sm">{topContributors[2].name}</p>
                              <p className="text-xs text-gray-600">{topContributors[2].total_trees} trees</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Stats */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      Quick Stats
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Top Contributor</span>
                        <span className="text-sm font-semibold text-green-600">{topContributors[0]?.total_trees} trees</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average per User</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {Math.round(topContributors.reduce((sum, u) => sum + u.total_trees, 0) / topContributors.length)} trees
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Most Active</span>
                        <span className="text-sm font-semibold text-purple-600">{topContributors[0]?.total_contributions} contributions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Leaderboard */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Full Leaderboard</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {topContributors.map((contributor, index) => (
                      <div key={contributor.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getRankIcon(contributor.rank)}
                              <span className="text-lg font-bold text-gray-900">#{contributor.rank}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{contributor.name}</p>
                              <p className="text-sm text-gray-500">Last contribution: {contributor.last_contribution}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                              <TreePine className="w-5 h-5" />
                              {contributor.total_trees}
                            </p>
                            <p className="text-sm text-gray-500">{contributor.total_contributions} contributions</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recognition Actions */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      Recognition & Rewards
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                        <h4 className="font-medium text-gray-900 mb-2">Top Contributor of the Month</h4>
                        <p className="text-sm text-gray-600 mb-3">Recognize the highest contributor this month</p>
                        <div className="flex items-center gap-2">
                          <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option>Select contributor...</option>
                            {topContributors.slice(0, 5).map(contributor => (
                              <option key={contributor.id} value={contributor.id}>
                                {contributor.name} - {contributor.total_trees} trees
                              </option>
                            ))}
                          </select>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            Award
                          </button>
                        </div>
                      </div>
                      
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
  <h4 className="font-medium text-gray-900 mb-2">Certificate Generation</h4>
  <p className="text-sm text-gray-600 mb-3">Generate certificates for outstanding contributors</p>
  <div className="space-y-2">
    {topContributors.slice(0, 3).map(contributor => (
      <div key={contributor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span className="text-sm font-medium">{contributor.name}</span>
        <button 
          onClick={() => generateCertificate(contributor)}
          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          PDF
        </button>
      </div>
    ))}
  </div>
</div>
                      
                    
                    </div>
                  </div>

                  {/* Reward Statistics */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Reward Impact
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Certificates Issued</span>
                          <span className="text-lg font-bold text-green-600">12</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      
                      
                      
                    </div>
                  </div>
                </div>

                {/* Recent Awards */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Recent Awards & Recognition</h4>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {topContributors.slice(0, 3).map((contributor, index) => (
                        <div key={contributor.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-4">
                            {getRankIcon(contributor.rank)}
                            <div>
                              <p className="font-semibold text-gray-900">{contributor.name}</p>
                              <p className="text-sm text-gray-600">Top Contributor - {contributor.total_trees} trees planted</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                              Certificate Issued
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing contribution details */}
      {showModal && selectedContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Contribution Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contributor Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Contributor Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedContribution.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedContribution.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Contribution Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contribution Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedContribution.contribution_type === 'Planting' ? 'bg-green-100 text-green-800' :
                        selectedContribution.contribution_type === 'Maintenance' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedContribution.contribution_type}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Action</p>
                      <p className="font-medium">{selectedContribution.action}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tree Species</p>
                      <p className="font-medium">{selectedContribution.tree_species}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium flex items-center gap-1">
                        <TreePine className="w-4 h-4 text-green-600" />
                        {selectedContribution.quantity}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Location & Date</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {selectedContribution.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <div>
  <p className="text-sm text-gray-600">Date</p>
  <p className="font-medium flex items-center gap-1">
    <Calendar className="w-4 h-4 text-gray-400" />
    {formatDate(selectedContribution.date)}
  </p>
</div>
                    </div>
                    {selectedContribution.survival_rate && (
                      <div>
                        <p className="text-sm text-gray-600">Survival Rate</p>
                        <p className="font-medium">{selectedContribution.survival_rate}%</p>
                      </div>
                    )}
                    {selectedContribution.frequency && (
                      <div>
                        <p className="text-sm text-gray-600">Frequency</p>
                        <p className="font-medium">{selectedContribution.frequency}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedContribution.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedContribution.notes}</p>
                  </div>
                </div>
              )}

              {/* Picture */}
              {selectedContribution.picture && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Photo Evidence</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                   <div className="relative group">
  <img 
    src={selectedContribution.picture?.startsWith('http') ? selectedContribution.picture : `http://localhost:3000${selectedContribution.picture}`} 
    alt="Contribution Evidence" 
    className="w-full h-64 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }}
    onClick={() => window.open(selectedContribution.picture?.startsWith('http') ? selectedContribution.picture : `http://localhost:3000${selectedContribution.picture}`, '_blank')}
  />
  <div className="hidden w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg items-center justify-center">
    <div className="text-center text-gray-500">
      <div className="w-12 h-12 mx-auto mb-2 opacity-50">📷</div>
      <p className="text-sm">Image not available</p>
    </div>
  </div>
  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
    <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">Click to enlarge</span>
  </div>
</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedContribution.status === 'pending' && (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedContribution.id, 'verified');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify Contribution
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedContribution.id, 'rejected');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Contribution
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContributionsPage;