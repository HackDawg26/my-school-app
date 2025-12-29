import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import { StudentDashboard } from './pages/student/StudentDashboard.tsx'
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.tsx'
import ProtectedRoute from './ProtectedRoute.tsx'
import {Unauthorized} from './pages/auth/Unauthorized.tsx'


function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Redirect empty path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
