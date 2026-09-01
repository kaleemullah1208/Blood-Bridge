import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { OnboardingModal } from './components/OnboardingModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { FindDonorsPage } from './pages/FindDonorsPage';
import { PostRequestPage } from './pages/PostRequestPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            {/* Top Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                {/* Public Views */}
                <Route path="/" element={<HomePage />} />
                <Route path="/find-donors" element={<FindDonorsPage />} />
                <Route path="/post-request" element={<PostRequestPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Views */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Profile Completion / Onboarding Modal */}
            <OnboardingModal />

            {/* Global Alert Toasts */}
            <ToastContainer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
