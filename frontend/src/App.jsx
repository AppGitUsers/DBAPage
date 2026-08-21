import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Videos from './pages/Videos'
import CoursePage from './pages/CoursePage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import { Quiz, Blogs, Labs, InterviewQuestions } from './pages/Placeholders'

function Layout() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/videos"              element={<Videos />} />
          <Route path="/courses/:slug"       element={<CoursePage />} />
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/admin"               element={<AdminDashboard />} />
          <Route path="/quiz"                element={<Quiz />} />
          <Route path="/blogs"               element={<Blogs />} />
          <Route path="/labs"                element={<Labs />} />
          <Route path="/interview-questions" element={<InterviewQuestions />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}
