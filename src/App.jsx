import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BoardProvider } from './context/BoardContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import FeedbackDetail from './pages/FeedbackDetail'
import BoardSettings from './pages/BoardSettings'
import NotFound from './pages/NotFound'
import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <BoardProvider>
        <BrowserRouter>
          <Routes>
            {/* Static routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/s/auth" element={<Auth />} />
            <Route path="/s/dashboard" element={<Dashboard />} />
            <Route path="/404" element={<NotFound />} />

            {/* Board routes (dynamic slug) */}
            <Route path="/:slug" element={<Board />} />
            <Route path="/:slug/feedback/:feedbackId" element={<FeedbackDetail />} />
            <Route path="/:slug/settings" element={<BoardSettings />} />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BoardProvider>
    </AuthProvider>
  )
}

export default App
