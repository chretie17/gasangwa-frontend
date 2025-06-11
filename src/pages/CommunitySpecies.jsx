import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  TreePine, 
  Leaf, 
  Search, 
  Filter, 
  Droplets, 
  Sun, 
  Thermometer, 
  Calendar, 
  Sprout, 
  Globe, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  X,
  ChevronDown,
  Heart,
  Star,
  Info
} from 'lucide-react';

const TreeSpeciesPage = () => {
  const [species, setSpecies] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    native: 'all',
    season: 'all',
    soilType: 'all',
    carbonRate: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  useEffect(() => {
    api.get('/tree-species')
      .then((response) => {
        setSpecies(response.data || []);
        setFilteredSpecies(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage('Error fetching tree species');
        setOpenSnackbar(true);
        console.error('Error fetching tree species:', error);
      });
  }, []);

  useEffect(() => {
    filterSpecies();
  }, [searchTerm, selectedFilters, species]);

  const filterSpecies = () => {
    let filtered = [...species];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.rwandan_name && item.rwandan_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.common_uses && item.common_uses.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Native filter
    if (selectedFilters.native !== 'all') {
      filtered = filtered.filter(item => 
        selectedFilters.native === 'native' ? item.native : !item.native
      );
    }

    // Season filter
    if (selectedFilters.season !== 'all') {
      filtered = filtered.filter(item =>
        item.planting_season && 
        item.planting_season.toLowerCase().includes(selectedFilters.season.toLowerCase())
      );
    }

    // Soil type filter
    if (selectedFilters.soilType !== 'all') {
      filtered = filtered.filter(item =>
        item.soil_type && 
        item.soil_type.toLowerCase().includes(selectedFilters.soilType.toLowerCase())
      );
    }

    // Carbon rate filter
    if (selectedFilters.carbonRate !== 'all') {
      filtered = filtered.filter(item => {
        const rate = parseFloat(item.carbon_rate);
        switch (selectedFilters.carbonRate) {
          case 'low': return rate < 15;
          case 'medium': return rate >= 15 && rate < 25;
          case 'high': return rate >= 25;
          default: return true;
        }
      });
    }

    setFilteredSpecies(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      native: 'all',
      season: 'all',
      soilType: 'all',
      carbonRate: 'all'
    });
    setSearchTerm('');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const getAdvice = (speciesItem) => {
    const advice = [];
    
    if (speciesItem.native) {
      advice.push({
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Native species adapt better to local climate and support local wildlife.'
      });
    }

    if (speciesItem.carbon_rate && parseFloat(speciesItem.carbon_rate) > 20) {
      advice.push({
        type: 'success',
        icon: <Leaf className="w-4 h-4" />,
        text: 'Excellent carbon absorption rate - great for climate action!'
      });
    }

    if (speciesItem.soil_improvement) {
      advice.push({
        type: 'info',
        icon: <Sprout className="w-4 h-4" />,
        text: 'This species improves soil quality over time.'
      });
    }

    if (speciesItem.planting_season && speciesItem.planting_season.toLowerCase().includes('march')) {
      advice.push({
        type: 'warning',
        icon: <Calendar className="w-4 h-4" />,
        text: 'Plant during rainy season (March-May) for best results.'
      });
    }

    return advice;
  };

  const renderSpeciesCard = (speciesItem) => (
    <div 
      key={speciesItem.id} 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-green-100 hover:border-green-300 cursor-pointer transform hover:scale-105"
      onClick={() => setSelectedSpecies(speciesItem)}
    >
      {/* Image Section */}
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100">
        {speciesItem.image_path ? (
          <img
            src={speciesItem.image_path}
            alt={speciesItem.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center" style={{display: speciesItem.image_path ? 'none' : 'flex'}}>
          <TreePine className="w-20 h-20 text-green-400" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {speciesItem.native && (
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Leaf className="w-3 h-3" />
              <span>Native</span>
            </span>
          )}
          {speciesItem.carbon_rate && parseFloat(speciesItem.carbon_rate) > 20 && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>High CO₂</span>
            </span>
          )}
        </div>

        {/* Carbon Rate Badge */}
        {speciesItem.carbon_rate && (
          <div className="absolute bottom-3 right-3 bg-green-700 text-white px-3 py-1 rounded-full text-sm font-bold">
            {speciesItem.carbon_rate} kg CO₂/year
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-green-800 mb-1">{speciesItem.name}</h3>
          {speciesItem.rwandan_name && (
            <p className="text-green-600 font-medium italic">"{speciesItem.rwandan_name}"</p>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {speciesItem.soil_type && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{speciesItem.soil_type}</span>
            </div>
          )}
          {speciesItem.planting_season && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{speciesItem.planting_season}</span>
            </div>
          )}
        </div>

        {/* Uses */}
        {speciesItem.common_uses && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              <span className="font-semibold text-green-700">Uses: </span>
              {speciesItem.common_uses}
            </p>
          </div>
        )}

        {/* Advice Preview */}
        {getAdvice(speciesItem).length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-semibold">Expert Tip</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {getAdvice(speciesItem)[0].text}
            </p>
          </div>
        )}

        {/* Click to learn more */}
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600 font-medium">Click to learn more →</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <TreePine className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Tree Species for Reforestation</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Discover the perfect trees for your land. Get expert advice on native and climate-friendly species that thrive in Rwanda.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-8 border-green-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, local name, or uses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-green-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Native Filter */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Origin</label>
                  <select
                    value={selectedFilters.native}
                    onChange={(e) => handleFilterChange('native', e.target.value)}
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="all">All Species</option>
                    <option value="native">Native Only</option>
                    <option value="introduced">Introduced Only</option>
                  </select>
                </div>

                {/* Season Filter */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Planting Season</label>
                  <select
                    value={selectedFilters.season}
                    onChange={(e) => handleFilterChange('season', e.target.value)}
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="all">Any Season</option>
                    <option value="march">March-May</option>
                    <option value="september">September-November</option>
                    <option value="year">Year Round</option>
                  </select>
                </div>

                {/* Soil Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Soil Type</label>
                  <select
                    value={selectedFilters.soilType}
                    onChange={(e) => handleFilterChange('soilType', e.target.value)}
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="all">Any Soil</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loam">Loam</option>
                    <option value="well-drained">Well-drained</option>
                  </select>
                </div>

                {/* Carbon Rate Filter */}
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">Carbon Absorption</label>
                  <select
                    value={selectedFilters.carbonRate}
                    onChange={(e) => handleFilterChange('carbonRate', e.target.value)}
                    className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="all">Any Rate</option>
                    <option value="high">High (&gt;25 kg/year)</option>
                    <option value="medium">Medium (15-25 kg/year)</option>
                    <option value="low">Low (&lt;15 kg/year)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-800 font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-green-700 font-medium">
            Showing {filteredSpecies.length} of {species.length} tree species
          </p>
        </div>

        {/* Species Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-700 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSpecies.length > 0 ? (
              filteredSpecies.map(renderSpeciesCard)
            ) : (
              <div className="col-span-full text-center py-20">
                <TreePine className="w-20 h-20 text-green-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">No species found</h3>
                <p className="text-green-600">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Species Modal */}
      {selectedSpecies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedSpecies.name}</h2>
                  {selectedSpecies.rwandan_name && (
                    <p className="text-green-100 text-lg italic">"{selectedSpecies.rwandan_name}"</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Image and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="h-64 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl overflow-hidden">
                  {selectedSpecies.image_path ? (
                    <img
                      src={selectedSpecies.image_path}
                      alt={selectedSpecies.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{display: selectedSpecies.image_path ? 'none' : 'flex'}}>
                    <TreePine className="w-24 h-24 text-green-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {selectedSpecies.native ? (
                      <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                        <Leaf className="w-4 h-4" />
                        <span>Native Species</span>
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                        Introduced Species
                      </span>
                    )}
                  </div>

                  {selectedSpecies.carbon_rate && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700 mb-2">
                        <Leaf className="w-5 h-5" />
                        <span className="font-semibold">Carbon Absorption</span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">{selectedSpecies.carbon_rate} kg CO₂/year</p>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSpecies.soil_type && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Globe className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-gray-700">Soil Type</p>
                        <p className="text-xs text-gray-600">{selectedSpecies.soil_type}</p>
                      </div>
                    )}
                    {selectedSpecies.planting_season && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-gray-700">Best Season</p>
                        <p className="text-xs text-gray-600">{selectedSpecies.planting_season}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expert Advice */}
              {getAdvice(selectedSpecies).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center space-x-2">
                    <Lightbulb className="w-6 h-6" />
                    <span>Expert Advice</span>
                  </h3>
                  <div className="space-y-3">
                    {getAdvice(selectedSpecies).map((advice, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg flex items-start space-x-3 ${
                          advice.type === 'success' ? 'bg-green-50 text-green-800' :
                          advice.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                          'bg-blue-50 text-blue-800'
                        }`}
                      >
                        <div className="mt-0.5">{advice.icon}</div>
                        <p className="text-sm">{advice.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedSpecies.growth_conditions && (
                  <div>
                    <h4 className="font-bold text-green-800 mb-2 flex items-center space-x-2">
                      <Sun className="w-5 h-5" />
                      <span>Growth Conditions</span>
                    </h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedSpecies.growth_conditions}</p>
                  </div>
                )}

                {selectedSpecies.common_uses && (
                  <div>
                    <h4 className="font-bold text-green-800 mb-2 flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Common Uses</span>
                    </h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedSpecies.common_uses}</p>
                  </div>
                )}

                {selectedSpecies.soil_improvement && (
                  <div>
                    <h4 className="font-bold text-green-800 mb-2 flex items-center space-x-2">
                      <Sprout className="w-5 h-5" />
                      <span>Soil Improvement</span>
                    </h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedSpecies.soil_improvement}</p>
                  </div>
                )}

                {selectedSpecies.environmental_impact && (
                  <div>
                    <h4 className="font-bold text-green-800 mb-2 flex items-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>Environmental Impact</span>
                    </h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedSpecies.environmental_impact}</p>
                  </div>
                )}
              </div>

              {selectedSpecies.notes && (
                <div className="mt-8">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Additional Notes</span>
                  </h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-lg">{selectedSpecies.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {openSnackbar && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
          <button
            onClick={handleCloseSnackbar}
            className="ml-4 text-white hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TreeSpeciesPage;