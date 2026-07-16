import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import ProductsPage from './pages/ProductsPage';
import OrderPage from './pages/OrderPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import CommentsPage from './pages/CommentsPage';
import LiveProductsPage from './pages/LiveProductsPage';
import DeliveryPage from './pages/DeliveryPage';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
          {/* Landing page - Page d'accueil par défaut */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Routes publiques pour les clients */}
          <Route path="/:linkId" element={<ProductsPage />} />
          <Route path="/:linkId/order/:productId" element={<OrderPage />} />
          <Route path="/:linkId/checkout" element={<CheckoutPage />} />
          <Route path="/:linkId/confirmation" element={<ConfirmationPage />} />
          <Route path="/:linkId/comments" element={<CommentsPage />} />
          <Route path="/:linkId/comments/:orderId" element={<CommentsPage />} />
          <Route path="/:linkId/live/:liveSlug" element={<LiveProductsPage />} />
          
          {/* Route pour les tickets de livraison (QR code) */}
          <Route path="/delivery/:orderId" element={<DeliveryPage />} />
          
          {/* Route 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Page non trouvée</h1>
                <p className="text-slate-600">La page que vous cherchez n'existe pas.</p>
              </div>
            </div>
          } />
        </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
