import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ScrollRestoration from './components/ScrollRestoration';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import QRVerification from './pages/QRVerification';
import ReviewSubmission from './pages/ReviewSubmission';
import ComplaintForm from './pages/ComplaintForm';
import TrustProfile from './pages/TrustProfile';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollRestoration />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/receiver" element={<ReceiverDashboard />} />
          <Route path="/qr/:id" element={<QRVerification />} />
          <Route path="/review/:id" element={<ReviewSubmission />} />
          <Route path="/complaint" element={<ComplaintForm />} />
          <Route path="/profile" element={<TrustProfile />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
