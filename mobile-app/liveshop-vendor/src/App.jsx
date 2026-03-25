import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CreditsProvider } from './contexts/CreditsContext';
import notificationStore from './stores/notificationStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPinPage from './pages/ResetPinPage';
import LogoutPage from './pages/LogoutPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import StatsPage from './pages/StatsPage';
import LivesPage from './pages/LivesPage';
import { Toaster } from 'sonner';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrderDetailPage from './pages/OrderDetailPage';
import CreditsPage from './pages/CreditsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSellersPage from './pages/AdminSellersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCreditsPage from './pages/AdminCreditsPage';
import AdminCreditsSettingsPage from './pages/AdminCreditsSettingsPage';
import AdminSellerDetailPage from './pages/AdminSellerDetailPage';
import AdminSecurityPage from './pages/AdminSecurityPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import WalletPage from './pages/WalletPage';
import SettingsPage from './pages/SettingsPage';
import TestImageUpload from './components/TestImageUpload';
import { AdminRoute, SellerRoute, AuthRoute } from './components/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const AppContent = () => {
  const { isAuthenticated, loading, isAdmin, token } = useAuth();

  // Initialiser le store de notifications
  useEffect(() => {
    if (loading) return;
    
    if (token) {
      notificationStore.setToken(token);
    } else {
      notificationStore.setToken(null);
    }
  }, [token]);

  // Demander la permission pour les notifications push
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PWAInstallPrompt />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={8000}
        expand={true}
        limit={3}
      />
      <Routes>
        {/* Routes publiques */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-pin" element={<ResetPinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/onboarding" element={isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" />} />

        {/* Routes protégées */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  {/* Routes Admin - Accessibles uniquement aux admins/superadmins */}
                  <Route path="admin" element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/sellers" element={
                    <AdminRoute>
                      <AdminSellersPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/sellers/:id" element={
                    <AdminRoute>
                      <AdminSellerDetailPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/orders" element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/products" element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/credits" element={
                    <AdminRoute>
                      <AdminCreditsPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/credits/settings" element={
                    <AdminRoute>
                      <AdminCreditsSettingsPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/security" element={
                    <AdminRoute>
                      <AdminSecurityPage />
                    </AdminRoute>
                  } />

                  {/* Routes Vendeurs - Accessibles uniquement aux vendeurs */}
                  <Route path="dashboard" element={
                    <SellerRoute>
                      <DashboardPage />
                    </SellerRoute>
                  } />
                  <Route path="products" element={
                    <SellerRoute>
                      <ProductsPage />
                    </SellerRoute>
                  } />
                  <Route path="orders" element={
                    <SellerRoute>
                      <OrdersPage />
                    </SellerRoute>
                  } />
                  <Route path="orders/:orderId" element={
                    <SellerRoute>
                      <OrderDetailPage />
                    </SellerRoute>
                  } />
                  <Route path="stats" element={
                    <SellerRoute>
                      <StatsPage />
                    </SellerRoute>
                  } />
                  <Route path="lives" element={
                    <SellerRoute>
                      <LivesPage />
                    </SellerRoute>
                  } />
                  {/* <Route path="credits" element={
                    <SellerRoute>
                      <CreditsPage />
                    </SellerRoute>
                  } /> */}
                  <Route path="credits" element={
                    <SellerRoute>
                      <CreditsPage />
                    </SellerRoute>
                  } />
                  <Route path="wallet" element={
                    <SellerRoute>
                      <WalletPage />
                    </SellerRoute>
                  } />
                  <Route path="payment-settings" element={
                    <SellerRoute>
                      <PaymentSettingsPage />
                    </SellerRoute>
                  } />
                  <Route path="settings" element={
                    <SellerRoute>
                      <SettingsPage />
                    </SellerRoute>
                  } />
                  <Route path="test-image-upload" element={
                    <SellerRoute>
                      <TestImageUpload />
                    </SellerRoute>
                  } />

                  {/* Route par défaut - Redirection selon le rôle */}
                  <Route path="*" element={
                    isAdmin ? (
                      <Navigate to="/admin" replace />
                    ) : localStorage.getItem('onboarding_completed') ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Navigate to="/onboarding" replace />
                    )
                  } />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditsProvider>
          <div className="App">
            <AppContent />
          </div>
        </CreditsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
