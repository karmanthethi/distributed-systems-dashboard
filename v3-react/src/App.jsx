import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedBg from './components/AnimatedBg';
import Navbar from './components/Navbar'; // We might use Layout instead of Navbar direct usage in Pages
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Apis from './pages/Apis';
import Analytics from './pages/Analytics';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Settings from './pages/Settings';

import { useAuth } from './context/AuthContext';

import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';

// Wrapper for pages that need layout
function LayoutWrapper({ Component }) {
  const { user, logout } = useAuth();
  const [stressTesting, setStressTesting] = useState(false);

  const handleStressTest = async () => {
    setStressTesting(true);
    await fetch('/api/stress-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: 10, requestsPerSecond: 10 })
    });
    setTimeout(() => setStressTesting(false), 10000);
  };

  return (
    <Layout user={user} logout={logout} stressInfo={{ isTesting: stressTesting, handleStressTest }}>
      <Component user={user} />
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimatedBg />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <LayoutWrapper Component={Dashboard} />
              </ProtectedRoute>
            } />

            <Route path="/services" element={
              <ProtectedRoute>
                <LayoutWrapper Component={Apis} />
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute>
                <LayoutWrapper Component={AnalyticsDashboard} />
              </ProtectedRoute>
            } />
            <Route path="/analytics/:apiId" element={
              <ProtectedRoute>
                <LayoutWrapper Component={Analytics} />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <LayoutWrapper Component={Settings} />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </ThemeProvider>
  );
}
