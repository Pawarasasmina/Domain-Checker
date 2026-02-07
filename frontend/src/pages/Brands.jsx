import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag, Download } from 'lucide-react';
import { format } from 'date-fns';
import { getBrandStyle } from '../utils/brandStyles';

const Brands = () => {
  const { isAdminOrManager } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/brands');
      setBrands(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch brands');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id}`, formData);
        toast.success('Brand updated successfully');
      } else {
        await api.post('/brands', formData);
        toast.success('Brand created successfully');
      }
      
      setShowModal(false);
      setFormData({ name: '' });
      setEditingBrand(null);
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name
    });
    setShowModal(true);
  };

  const handleDelete = async (id, brandName) => {
    if (window.confirm(`Are you sure you want to delete ${brandName}?`)) {
      try {
        await api.delete(`/brands/${id}`);
        toast.success('Brand deleted successfully');
        fetchBrands();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const exportToCSV = () => {
    try {
      // CSV headers
      const headers = ['Brand Name', 'Brand Code', 'Description', 'Color', 'Status', 'Created At'];
      
      // CSV rows
      const rows = brands.map(brand => [
        brand.name,
        brand.code,
        brand.description || '',
        brand.color,
        brand.isActive ? 'Active' : 'Inactive',
        format(new Date(brand.createdAt), 'MMM dd, yyyy HH:mm')
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `brands-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${brands.length} brands to CSV`);
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brands</h1>
          <p className="text-gray-600">Manage all your domain brands</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={exportToCSV}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={brands.length === 0}
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
          {isAdminOrManager() && (
            <button
              onClick={() => {
              setEditingBrand(null);
              setFormData({ name: '' });
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Brand</span>
          </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {brands.map((brand) => {
          const brandStyle = getBrandStyle(brand.code);
          return (
          <div 
            key={brand._id} 
            className="card p-3 hover:shadow-lg hover:scale-105 transition-all duration-200 relative group cursor-pointer"
          >
            {isAdminOrManager() && (
              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => handleEdit(brand)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded bg-white shadow-sm"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(brand._id, brand.name)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded bg-white shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            <div className="flex flex-col items-center justify-center py-3">
              <span 
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-extrabold uppercase tracking-wide shadow-sm w-full text-center"
                style={{ 
                  background: brandStyle.background,
                  color: brandStyle.color,
                  letterSpacing: '0.5px'
                }}
              >
                {brand.name}
              </span>
            </div>
          </div>
          );
        })}
      </div>

      {/* Empty State */}
      {brands.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first brand</p>
          {isAdminOrManager() && (
            <button
              onClick={() => {
                setEditingBrand(null);
                setFormData({ name: '', code: '', description: '', color: '#3B82F6' });
                setShowModal(true);
              }}
              className="btn btn-primary"
            >
              Add Brand
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value.toUpperCase() })}
                  required
                  placeholder="A200M"
                  className="input"
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingBrand ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBrand(null);
                    setFormData({ name: '', code: '', description: '', color: '#3B82F6' });
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
