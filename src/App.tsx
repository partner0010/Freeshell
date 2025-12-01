import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer, useToast } from './components/Toast'
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
import Profile from './pages/Profile'
import Schedules from './pages/Schedules'
import Templates from './pages/Templates'

function AppContent() {
  const toast = useToast()

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<ContentCreator />} />
                <Route path="/preview" element={<Preview />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/revenue" element={<RevenueDashboard />} />
                <Route path="/auto" element={<AutoCreator />} />
                <Route path="/global" element={<GlobalCreator />} />
                <Route path="/ebook" element={<EbookCreator />} />
                <Route path="/blog" element={<BlogManager />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/schedules" element={<Schedules />} />
                <Route path="/templates" element={<Templates />} />
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

