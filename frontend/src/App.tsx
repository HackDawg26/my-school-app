import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import AdminDashboard from './pages/admin/dasboard/AdminDashboard.tsx';
import { StudentDashboard } from './pages/student/dashboard/StudentDashboard.tsx';
import { TeacherDashboard } from './pages/teacher/dashboard/TeacherDashboard.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import { Unauthorized } from './pages/auth/Unauthorized.tsx';
import Layout from '../src/components/Layout.tsx'; // Import your new Layout
import { useAuth } from '../src/context/AuthContext.tsx'; // Import your auth hook
import { FacultyPage } from './pages/admin/faculty/FacultyPage.tsx';
import { StudentsPage } from './pages/admin/students/StudentsPage.tsx';
import GradeLogs from './pages/admin/gradelogs/GradeLogs.tsx';
import { SectionPage } from './pages/admin/section/SectionPage.tsx';
import { StudentSubjectsPage } from './pages/student/subjects/StudentSubjectsPage.tsx';
import { Gradebook } from './pages/student/gradebook/Gradebook.tsx';
import { StudentSubmissions } from './pages/student/submission/StudentSubmissions.tsx';
import { TeacherSubjectPage } from './pages/teacher/subjects/TeacherSubjectPage.tsx';
import TeacherGradebook from './pages/teacher/gradebook/TeacherGradebook.tsx';
import { TeacherSubmissions } from './pages/teacher/submissions/TeacherSubmissions.tsx';
import { AdvisoryClass } from './pages/teacher/advisoryClass/AdvisoryClass.tsx';

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 2. PROTECTED APP AREA (Requires Login) */}
        {/* We wrap everything in a general ProtectedRoute first */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']} />}>
          
          {/* 3. LAYOUT WRAPPER 
              Every route inside here will have the Sidebar and Topbar 
          */}
          <Route element={<Layout />}>
            
            {/* Student Domain */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/subjects" element={<StudentSubjectsPage />} />
              <Route path="/student/gradebook" element={<Gradebook />} />
              <Route path="/student/submissions" element={<StudentSubmissions />} />
              {/* You can add more student pages here like /student/grades */}
            </Route>

            {/* Teacher Domain */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/subject" element={<TeacherSubjectPage />} />
              <Route path="/teacher/gradebook" element={<TeacherGradebook />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/advisory-class" element={<AdvisoryClass />} />
              {/* You can add more teacher pages here like /teacher/analytics */}

            </Route>

            {/* Admin Domain */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/faculty" element={<FacultyPage />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/sections" element={<SectionPage />} />
              <Route path="/admin/gradelogs" element={<GradeLogs />} />
            </Route>

          </Route>
        </Route>

        {/* 4. Global Redirects */}
        <Route path="/" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<div className="p-10 text-center">404: Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;