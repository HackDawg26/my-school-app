import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import { Unauthorized } from './pages/auth/Unauthorized.tsx';

// Senior Dev Tip: Create a simple layout wrapper for your dashboards
// This prevents you from re-writing the Sidebar code 3 times.
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-gray-50">
    {/* This is where your Sidebar component will eventually go */}
    <aside className="w-64 bg-indigo-900 text-white hidden md:block p-6">
      <h1 className="text-xl font-bold">ClaroEd Menu</h1>
      {/* Navigation links will go here */}
    </aside>
    
    <main className="flex-1 p-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Routes (No Protection) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 2. Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route 
            path="/student/dashboard" 
            element={<DashboardLayout><StudentDashboard /></DashboardLayout>} 
          />
        </Route>

        {/* 3. Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
          <Route 
            path="/teacher/dashboard" 
            element={<DashboardLayout><TeacherDashboard /></DashboardLayout>} 
          />
        </Route>

        {/* 4. Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route 
            path="/admin/dashboard" 
            element={<DashboardLayout><AdminDashboard /></DashboardLayout>} 
          />
        </Route>

        {/* 5. Navigation Logic */}
        {/* Redirect root "/" to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all: If user types a URL that doesn't exist, show this */}
        <Route path="*" element={
          <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">404</h1>
            <p className="text-gray-600">This page doesn't exist.</p>
            <button 
              onClick={() => window.history.back()}
              className="text-indigo-600 hover:underline"
            >
              Go Back
            </button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;