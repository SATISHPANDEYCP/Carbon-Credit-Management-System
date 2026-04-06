import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionHistoryPage from './pages/TransactionHistoryPage'
import OffsetProjectsPage from './pages/OffsetProjectsPage'
import AddActivityPage from './pages/AddActivityPage'
import AddReductionPage from './pages/AddReductionPage'
import ShareCreditsPage from './pages/ShareCreditsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          } />
          
          <Route path="/offset-projects" element={
            <ProtectedRoute>
              <OffsetProjectsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/add-activity" element={
            <ProtectedRoute>
              <AddActivityPage />
            </ProtectedRoute>
          } />
          
          <Route path="/add-reduction" element={
            <ProtectedRoute>
              <AddReductionPage />
            </ProtectedRoute>
          } />
          
          <Route path="/share-credits" element={
            <ProtectedRoute>
              <ShareCreditsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
