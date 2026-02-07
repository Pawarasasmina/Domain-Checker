import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { initSocket, disconnectSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
        initSocket(token);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      initSocket(token);
      toast.success('Login successful!');
      navigate('/');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    disconnectSocket();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isManager = () => {
    return user?.role === 'manager';
  };

  const isAdminOrManager = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isManager,
    isAdminOrManager,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
