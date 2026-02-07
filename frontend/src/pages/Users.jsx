import { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updateData = { ...formData };
        // Don't send password if it's empty
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/auth/users/${editingUser._id}`, updateData);
        toast.success('User updated successfully');
      } else {
        await api.post('/auth/register', formData);
        toast.success('User created successfully');
      }
      
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await api.delete(`/auth/users/${id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/auth/users/${userId}`, { isActive: !currentStatus });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-600">Manage system users and their access</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td>{index + 1}</td>
                  <td className="font-medium">{user.name}</td>
                  <td className="text-gray-600">{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' ? 'badge-info' : 
                      user.role === 'manager' ? 'badge-warning' : 
                      'badge-secondary'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className="flex items-center space-x-1"
                    >
                      {user.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        user.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="text-sm text-gray-600">
                    {user.lastLogin 
                      ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')
                      : 'Never'}
                  </td>
                  <td className="text-sm text-gray-600">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first user</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingUser && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder="••••••••"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="input"
                >
                  <option value="user">User (View Only)</option>
                  <option value="manager">Manager (Manage Domains & Brands)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', password: '', role: 'user' });
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

export default Users;
