import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { OnboardingModal } from './components/OnboardingModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

import { RouteLoadingIndicator } from './components/RouteLoadingIndicator';
import { BrandPreloader } from './components/BrandPreloader';

// Pages
import { HomePage } from './pages/HomePage';
import { FindDonorsPage } from './pages/FindDonorsPage';
import { PostRequestPage } from './pages/PostRequestPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            {/* Initial Site Entry Splash Preloader (1.8s) */}
            <BrandPreloader duration={1800} />

            {/* Top Arterial Route Progress Bar & Transition */}
            <RouteLoadingIndicator />

            {/* Top Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                {/* Public Views */}
                <Route path="/" element={<HomePage />} />
                <Route path="/find-donors" element={<FindDonorsPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/adminlogin" element={<AdminLoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected: requires login */}
                <Route
                  path="/post-request"
                  element={
                    <ProtectedRoute>
                      <PostRequestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin & Operations Routes & Aliases */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-panel"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin-portal"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/panel"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/portal"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/adminpanel"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/adminportal"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />

                {/* 404 Not Found Page */}
                <Route path="*" element={<NotFoundPage />} />
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
