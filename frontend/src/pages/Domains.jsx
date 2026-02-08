import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, AlertCircle, Download, Upload, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { getBrandStyle } from '../utils/brandStyles';

const Domains = () => {
  const { isAdminOrManager } = useAuth();
  const [domains, setDomains] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedNawala, setSelectedNawala] = useState('');
  const [page, setPage] = useState(1);
  const [totalDomains, setTotalDomains] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const limit = 50;
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [domainToDelete, setDomainToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [blockedDomainsList, setBlockedDomainsList] = useState([]);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');
  const [formData, setFormData] = useState({
    domain: '',
    brand: '',
    note: ''
  });

  useEffect(() => {
    fetchDomains();
    fetchBrands();
    
    const socket = getSocket();
    if (socket) {
      // Remove any existing listeners to prevent duplicates
      socket.off('domain:created');
      socket.off('domain:updated');
      socket.off('domain:deleted');
      socket.off('domain:nawala-updated');
      socket.off('domains:bulk-nawala-updated');
      socket.off('domains:bulk-deleted');
      socket.off('domains:bulk-imported');
      socket.off('domains:bulk-check-complete');

      // Set up new listeners
      socket.on('domain:created', (domain) => {
        setDomains(prev => [domain, ...prev]);
        toast.success(`New domain added: ${domain.domain}`);
      });

      socket.on('domain:updated', (domain) => {
        setDomains(prev => prev.map(d => d._id === domain._id ? domain : d));
        toast.success(`Domain updated: ${domain.domain}`);
      });

      socket.on('domain:deleted', ({ id }) => {
        setDomains(prev => prev.filter(d => d._id !== id));
        toast.success('Domain deleted');
      });

      socket.on('domain:nawala-updated', ({ domainId, domain, nawala }) => {
        setDomains(prev => prev.map(d => 
          d._id === domainId ? { ...d, nawala } : d
        ));
        
        // Only show notification when domain is blocked
        if (nawala.status === 'ada') {
          toast.error(`🔴 ${domain} is now BLOCKED`, {
            duration: 4000,
            style: {
              background: '#fee',
              color: '#c00'
            }
          });
        }
      });

      // Handle batched updates efficiently
      socket.on('domains:bulk-nawala-updated', ({ updates, count }) => {
        setDomains(prev => {
          const updatedDomains = [...prev];
          updates.forEach(update => {
            const index = updatedDomains.findIndex(d => d._id === update.domainId);
            if (index !== -1) {
              updatedDomains[index] = { ...updatedDomains[index], nawala: update.nawala };
            }
          });
          return updatedDomains;
        });
        
        // Show individual toast for each newly blocked domain
        const blockedDomains = updates.filter(u => u.nawala.status === 'ada');
        blockedDomains.forEach(update => {
          toast.error(`Domain blocked: ${update.domain}`, {
            duration: 4000,
            style: {
              background: '#fee',
              color: '#c00'
            }
          });
        });
      });

      socket.on('domains:bulk-check-complete', ({ success, failed }) => {
        fetchDomains();
        toast.success(`Bulk check complete: ${success} updated`);
      });

      socket.on('domains:bulk-deleted', ({ count }) => {
        fetchDomains();
        toast.success(`${count} blocked domains deleted`);
      });

      socket.on('domains:bulk-imported', ({ count }) => {
        fetchDomains();
        toast.success(`${count} domains imported`);
      });
    }

    // Cleanup function to remove listeners on unmount
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('domain:created');
        socket.off('domain:updated');
        socket.off('domain:deleted');
        socket.off('domain:nawala-updated');
        socket.off('domains:bulk-nawala-updated');
        socket.off('domains:bulk-deleted');
        socket.off('domains:bulk-imported');
        socket.off('domains:bulk-check-complete');
      }
    };
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await api.get('/domains', {
        params: {
          search: searchTerm,
          brand: selectedBrand,
          nawala: selectedNawala,
          page: page,
          limit: limit
        }
      });
      setDomains(response.data.data);
      setTotalDomains(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
      setTotalBlocked(response.data.totalBlocked || 0);
    } catch (error) {
      toast.error('Failed to fetch domains');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands?isActive=true');
      setBrands(response.data.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  // Refetch when page or filters change
  useEffect(() => {
    fetchDomains();
  }, [page, searchTerm, selectedBrand, selectedNawala]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDomain) {
        await api.put(`/domains/${editingDomain._id}`, formData);
        toast.success('Domain updated successfully');
      } else {
        await api.post('/domains', formData);
        toast.success('Domain created successfully');
      }
      
      setShowModal(false);
      setFormData({ domain: '', brand: '', note: '' });
      setEditingDomain(null);
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (domain) => {
    setEditingDomain(domain);
    setFormData({
      domain: domain.domain,
      brand: domain.brand._id,
      note: domain.note || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, domainName) => {
    setDomainToDelete({ id, domainName });
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await api.delete(`/domains/${domainToDelete.id}`);
      toast.success('Domain deleted successfully');
      setShowDeleteModal(false);
      setDomainToDelete(null);
      setDeleteConfirmText('');
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ada':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'tidak ada':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getUptimeButton = (status) => {
    switch (status) {
      case 'up':
        return (
          <button className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200" title="Up">
            Up
          </button>
        );
      case 'down':
        return (
          <button className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200" title="Down">
            Down
          </button>
        );
      default:
        return (
          <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200" title="Unknown">
            Unknown
          </button>
        );
    }
  };

  const getCloudflareButton = (status) => {
    switch (status) {
      case 'active':
        return (
          <button className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 hover:bg-orange-200" title="Active">
            Active
          </button>
        );
      case 'inactive':
        return (
          <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200" title="Inactive">
            Inactive
          </button>
        );
      default:
        return (
          <button className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200" title="Unknown">
            Unknown
          </button>
        );
    }
  };

  // Domains are already filtered by backend
  const filteredDomains = domains;

  const blockedDomainsCount = totalBlocked;

  const exportToCSV = async () => {
    try {
      toast.loading('Fetching all domains for export...');
      
      // Fetch ALL domains (no pagination limit)
      const response = await api.get('/domains', {
        params: {
          search: searchTerm,
          brand: selectedBrand,
          nawala: selectedNawala,
          limit: 999999 // Get all domains
        }
      });
      
      const allDomains = response.data.data;
      
      // CSV headers
      const headers = ['Domain', 'Brand', 'Note', 'Nawala Status', 'Last Checked', 'Created At'];
      
      // CSV rows
      const rows = allDomains.map(domain => [
        domain.domain,
        domain.brand?.name || 'N/A',
        domain.note || '',
        domain.nawala?.status || 'belum dicek',
        domain.nawala?.lastChecked ? format(new Date(domain.nawala.lastChecked), 'MMM dd, yyyy HH:mm') : 'N/A',
        format(new Date(domain.createdAt), 'MMM dd, yyyy HH:mm')
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
      link.setAttribute('download', `domains-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success(`Exported ${allDomains.length} domains to CSV`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export CSV');
      console.error(error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('CSV file is empty or invalid');
          setImporting(false);
          return;
        }

        // Parse CSV
        const parseLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseLine(lines[0]);
        const domains = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseLine(lines[i]);
          
          // Expected format: Domain, Brand, Note
          if (values.length >= 2 && values[0] && values[1]) {
            domains.push({
              domain: values[0],
              brand: values[1],
              note: values[2] || ''
            });
          }
        }

        if (domains.length === 0) {
          toast.error('No valid domains found in CSV');
          setImporting(false);
          return;
        }

        // Send to backend
        const response = await api.post('/domains/bulk-import', { domains });
        
        const { success, failed, skipped } = response.data.data;
        
        // Show results
        const resultMessage = `Import completed!\n✅ ${success.length} added\n⏭️ ${skipped.length} skipped\n❌ ${failed.length} failed`;
        
        if (failed.length === 0) {
          toast.success(resultMessage, { duration: 5000 });
        } else {
          toast.error(resultMessage, { duration: 8000 });
        }

        // Show detailed errors if any
        if (failed.length > 0) {
          console.group('Import Errors');
          console.table(failed);
          console.groupEnd();
          
          // Show first few errors in a more readable format
          const errorSummary = failed.slice(0, 5).map(f => 
            `Row ${f.row}: ${f.domain} - ${f.error}`
          ).join('\n');
          
          console.warn('First 5 errors:\n' + errorSummary);
          
          if (failed.length > 5) {
            console.warn(`... and ${failed.length - 5} more errors. Check console table for full details.`);
          }
          
          toast.error(
            `${failed.length} imports failed. Check console (F12) for details.`,
            { duration: 10000 }
          );
        }

        setShowBulkModal(false);
        fetchDomains();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Import failed');
        console.error(error);
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'Domain,Brand,Note\nexample.com,A200M,Sample note\ntest.com,B200M,Another note';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'domain-import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template downloaded');
  };

  const deleteAllBlocked = async () => {
    if (blockedDomainsCount === 0) {
      toast.error('No blocked domains to delete');
      return;
    }

    try {
      // Fetch all blocked domains to show in modal
      const response = await api.get('/domains', {
        params: {
          nawala: 'ada',
          limit: 999999
        }
      });
      
      setBlockedDomainsList(response.data.data);
      setDeleteAllConfirmText('');
      setShowDeleteAllModal(true);
    } catch (error) {
      toast.error('Failed to fetch blocked domains');
    }
  };

  const confirmDeleteAllBlocked = async () => {
    if (deleteAllConfirmText !== 'DELETE ALL') {
      toast.error('Please type DELETE ALL to confirm');
      return;
    }

    try {
      const response = await api.delete('/domains/bulk-delete-blocked');
      toast.success(response.data.message);
      setShowDeleteAllModal(false);
      setBlockedDomainsList([]);
      setDeleteAllConfirmText('');
      fetchDomains();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete blocked domains');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Money Sites</h1>
          <p className="text-gray-600">Manage and monitor all your domains</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={exportToCSV}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={filteredDomains.length === 0}
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
          {isAdminOrManager() && (
            <>
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Upload size={20} />
                <span>Import CSV</span>
              </button>
              <button
                onClick={() => {
                  setEditingDomain(null);
                  setFormData({ domain: '', brand: '', note: '' });
                  setShowModal(true);
                }}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Domain</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="input"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>{brand.name}</option>
            ))}
          </select>
          <select
            value={selectedNawala}
            onChange={(e) => setSelectedNawala(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="ada">🔴 Blocked (Ada)</option>
            <option value="tidak ada">🟢 Accessible (Tidak Ada)</option>
            <option value="belum dicek">⚪ Not Checked</option>
          </select>
        </div>
        {isAdminOrManager() && blockedDomainsCount > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
            <div>
              <p className="text-sm font-medium text-red-800">
                {blockedDomainsCount} blocked domain{blockedDomainsCount !== 1 ? 's' : ''} found
              </p>
              <p className="text-xs text-red-600">Click to delete all blocked domains permanently</p>
            </div>
            <button
              onClick={deleteAllBlocked}
              className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete All Blocked</span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th className="w-36">Created</th>
                <th className="w-24">Brand</th>
                <th className="min-w-48">Domain</th>
                <th className="w-32">Note</th>
                <th className="w-24 text-center">Uptime</th>
                <th className="w-20 text-center">Nawala</th>
                <th className="w-28 text-center">Cloudflare</th>
                <th className="w-36">Updated</th>
                {isAdminOrManager() && <th className="w-20 sticky right-0 bg-white">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDomains.map((domain, index) => {
                const brandStyle = getBrandStyle(domain.brand.code);
                return (
                <tr key={domain._id} className="hover:bg-gray-50">
                  <td className="text-sm">{(page - 1) * limit + index + 1}</td>
                  <td className="text-xs text-gray-600 whitespace-nowrap">
                    {format(new Date(domain.createdAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase"
                      style={{
                        background: brandStyle.background,
                        color: brandStyle.color
                      }}
                    >
                      {domain.brand.code}
                    </span>
                  </td>
                  <td className="font-medium text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{domain.domain}</span>
                      <a
                        href={`https://${domain.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Open domain in new tab"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600 truncate max-w-32" title={domain.note}>
                    {domain.note || '-'}
                  </td>
                  <td className="text-center">
                    {getUptimeButton(domain.uptime?.status)}
                  </td>
                  <td className="text-center">
                    {getStatusIcon(domain.nawala.status)}
                  </td>
                  <td className="text-center">
                    {getCloudflareButton(domain.cloudflare?.status)}
                  </td>
                  <td className="text-xs text-gray-600 whitespace-nowrap">
                    {format(new Date(domain.updatedAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  {isAdminOrManager() && (
                    <td className="sticky right-0 bg-white">
                      <div className="flex space-x-1 justify-center">
                        <button
                          onClick={() => handleEdit(domain)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(domain._id, domain.domain)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, totalDomains)}</span> of{' '}
                <span className="font-medium">{totalDomains}</span> domains
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first 2, last 2, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === 2 ||
                      pageNum === totalPages ||
                      pageNum === totalPages - 1 ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === 3 && page > 4) ||
                      (pageNum === totalPages - 2 && page < totalPages - 3)
                    ) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingDomain ? 'Edit Domain' : 'Add New Domain'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  required
                  placeholder="example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="input"
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add notes..."
                  rows="3"
                  className="input"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingDomain ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDomain(null);
                    setFormData({ domain: '', brand: '', note: '' });
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

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Bulk Import Domains</h2>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">CSV Format</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Your CSV file should have these columns:
                </p>
                <code className="block bg-white p-2 rounded text-xs mb-2">
                  Domain,Brand,Note
                </code>
                <p className="text-sm text-blue-800">
                  Example: example.com,A200M,Sample note
                </p>
              </div>

              <button
                onClick={downloadTemplate}
                className="btn btn-secondary w-full mb-4 flex items-center justify-center space-x-2"
              >
                <Download size={18} />
                <span>Download Template</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              
              <label
                htmlFor="csv-upload"
                className={`btn btn-primary w-full flex items-center justify-center space-x-2 cursor-pointer ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload size={18} />
                <span>{importing ? 'Importing...' : 'Choose CSV File'}</span>
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Duplicate domains will be skipped. Make sure brand names match exactly.
              </p>
            </div>

            <button
              onClick={() => setShowBulkModal(false)}
              className="btn btn-secondary w-full"
              disabled={importing}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && domainToDelete && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Domain</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-2">
                You are about to delete:
              </p>
              <p className="font-mono text-sm font-semibold text-red-900 break-all">
                {domainToDelete.domainName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="input w-full"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDomainToDelete(null);
                  setDeleteConfirmText('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText !== 'DELETE'}
                className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                Delete Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Blocked Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-3xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete All Blocked Domains</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-3 font-semibold">
                You are about to delete {blockedDomainsList.length} blocked domain{blockedDomainsList.length !== 1 ? 's' : ''}:
              </p>
              <div className="max-h-60 overflow-y-auto bg-white rounded border border-red-200 p-3">
                <ul className="space-y-2">
                  {blockedDomainsList.map((domain, index) => (
                    <li key={domain._id} className="text-sm text-gray-700 flex items-start">
                      <span className="font-mono text-red-600 mr-2">{index + 1}.</span>
                      <span className="font-mono break-all">{domain.domain}</span>
                      {domain.brand && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                          {domain.brand.code}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE ALL</span> to confirm
              </label>
              <input
                type="text"
                value={deleteAllConfirmText}
                onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                placeholder="Type DELETE ALL"
                className="input w-full"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setBlockedDomainsList([]);
                  setDeleteAllConfirmText('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAllBlocked}
                disabled={deleteAllConfirmText !== 'DELETE ALL'}
                className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                Delete All ({blockedDomainsList.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Domains;
