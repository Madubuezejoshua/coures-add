import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ContributorSignUpPage } from './pages/ContributorSignUpPage';
import { ContributorLoginPage } from './pages/ContributorLoginPage';
import { ReviewerSignUpPage } from './pages/ReviewerSignUpPage';
import { ReviewerLoginPage } from './pages/ReviewerLoginPage';
import { PublisherSignUpPage } from './pages/PublisherSignUpPage';
import { PublisherLoginPage } from './pages/PublisherLoginPage';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/contributor/signup" element={<ContributorSignUpPage />} />
          <Route path="/contributor/login" element={<ContributorLoginPage />} />
          <Route path="/reviewer/signup" element={<ReviewerSignUpPage />} />
          <Route path="/reviewer/login" element={<ReviewerLoginPage />} />
          <Route path="/publisher/signup" element={<PublisherSignUpPage />} />
          <Route path="/publisher/login" element={<PublisherLoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contributor/dashboard" element={<Dashboard />} />
          <Route path="/reviewer/dashboard" element={<Dashboard />} />
          <Route path="/publisher/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
