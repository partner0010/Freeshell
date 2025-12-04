import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer, useToast } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import ContentCreator from './pages/ContentCreator'
import Preview from './pages/Preview'
import Settings from './pages/Settings'
import RevenueDashboard from './pages/RevenueDashboard'
import EbookCreator from './pages/EbookCreator'
import BlogManager from './pages/BlogManager'
import AutoCreator from './pages/AutoCreator'
import GlobalCreator from './pages/GlobalCreator'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterWithOTP from './pages/RegisterWithOTP'
import Profile from './pages/Profile'
import Schedules from './pages/Schedules'
import Templates from './pages/Templates'
import Admin from './pages/Admin'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import MyPage from './pages/MyPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import AdvancedAI from './pages/AdvancedAI'
import AutoCreation from './pages/AutoCreation'
import RemoteSupport from './pages/RemoteSupport'

function AppContent() {
  const toast = useToast()

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterWithOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create" element={<ProtectedRoute><ContentCreator /></ProtectedRoute>} />
                <Route path="/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/revenue" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} />
                <Route path="/auto" element={<ProtectedRoute><AutoCreator /></ProtectedRoute>} />
                <Route path="/global" element={<ProtectedRoute><GlobalCreator /></ProtectedRoute>} />
                <Route path="/ebook" element={<ProtectedRoute><EbookCreator /></ProtectedRoute>} />
                <Route path="/blog" element={<ProtectedRoute><BlogManager /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
                <Route path="/schedules" element={<ProtectedRoute><Schedules /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                <Route path="/advanced-ai" element={<ProtectedRoute><AdvancedAI /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App

