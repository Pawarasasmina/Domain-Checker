import AdminLogs from './pages/AdminLogs';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Domains from './pages/Domains';
import Brands from './pages/Brands';
import Users from './pages/Users';
import ManualChecker from './pages/ManualChecker';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/domains"
            element={
              <ProtectedRoute>
                <Layout>
                  <Domains />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/brands"
            element={
              <ProtectedRoute>
                <Layout>
                  <Brands />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-logs"
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminLogs />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/manual-checker"
            element={
              <ProtectedRoute>
                <Layout>
                  <ManualChecker />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
