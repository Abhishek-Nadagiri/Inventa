/**
 * Inventa - Main Application Component
 * "Where Ownership Begins"
 * 
 * A secure intellectual property document protection and ownership verification system.
 * 
 * Features:
 * - User registration and authentication with ECC key pair generation
 * - Document upload with SHA-256 hashing and AES-GCM encryption
 * - Cryptographic ownership binding using ECDSA signatures
 * - Secure timestamping for proof of origin
 * - Document verification via file upload or hash comparison
 * - Downloadable ownership proofs
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Verify } from './pages/Verify';
import { DatabasePage } from './pages/Database';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route Component
 * Redirects unauthenticated users to login page
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Public Route Component
 * Redirects authenticated users away from auth pages
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * App Layout Component
 * Wraps pages with navigation bar
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

/**
 * Main App Component
 * Sets up routing and authentication context
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth Routes - redirect if already logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes - require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Upload />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Verify is accessible to everyone */}
      <Route
        path="/verify"
        element={
          <AppLayout>
            <Verify />
          </AppLayout>
        }
      />

      {/* Database Viewer - for debugging/admin */}
      <Route
        path="/database"
        element={
          <DatabasePage />
        }
      />

      {/* Fallback - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
