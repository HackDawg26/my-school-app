import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import { Unauthorized } from './pages/auth/Unauthorized.tsx';
import Layout from './components/Layout.tsx';
import { useAuth } from './context/AuthContext.tsx';

// student imports
import SubjectsPage from './pages/student/subjects/student-subjects.tsx';
import GradesPage from './pages/student/gradebook/student-grades.tsx';
import { StudentSubmissions } from './pages/student/submission/StudentSubmissions.tsx';
import StudentSubjectpage from './pages/student/subjects/student-subjects-id.tsx';

// teacher imports
import TeacherSubmissions from './pages/teacher/submissions/TeacherSubmissions.tsx';
import AdvisoryClass from './pages/teacher/advisoryClass/AdvisoryClass.tsx';
import TeacherDashboard from './pages/teacher/dashboard/TeacherDashboard.tsx';
import Gradebook from './pages/teacher/gradebook/GradeBook.tsx';
import ExportReportCardPDF from './pages/teacher/advisoryClass/SF9.tsx';
import SubjectListPage from './pages/teacher/subjects/subject.tsx';
import SubjectCreationForm from './pages/teacher/subjects/create-subject.tsx';
import SubjectProvider from './pages/teacher/subjects/SubjectProvider.tsx';
import SubjectPage from './pages/teacher/subjects/SubjectPage.tsx';

// admin imports
import AdminDashboard from './pages/admin/dasboard/AdminDashboard.tsx';
import { FacultyList } from './pages/admin/faculty/departmentId.tsx';
import { StudentClassList } from './pages/admin/students/Student_classlist.tsx';
import { FacultyPage } from './pages/admin/faculty/FacultyPage.tsx';
import { StudentAccountsPage } from './pages/admin/students/StudentsPage.tsx';
import GradeLogs from './pages/admin/gradelogs/GradeLogs.tsx';
import AccountListPage from './pages/admin/accounts/Account-list.tsx';
import CreateSubjectPage from './pages/admin/students/create-subject.tsx';
import CreateTeacherAccountPage from './pages/admin/accounts/create-accounts/Create-teacher-account.tsx';
import CreateStudentAccountPage from './pages/admin/accounts/create-accounts/Create-student-account.tsx';
import CreateAdminAccountPage from './pages/admin/accounts/create-accounts/Create-admin-account.tsx';

function App() {
  const { user} = useAuth(); // include loading

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 2. Protected App Area */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']} />}>
          <Route element={<Layout />}>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student/subject" element={<SubjectsPage />} />
              <Route path="/student/subject/:id" element={<StudentSubjectpage />} />
              <Route path="/student/gradebook" element={<GradesPage />} />
              <Route path="/student/submissions" element={<StudentSubmissions />} />
            </Route>

            {/* Teacher Routes */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route element={<SubjectProvider />}>
                <Route path='teacher/subject'>
                  <Route index element={<SubjectListPage />} />
                  <Route path='create-subject' element={<SubjectCreationForm />} />
                  <Route path=':id' element={<SubjectPage />} />
                </Route>
              </Route>
              <Route path="/teacher/gradebook" element={<Gradebook />} />
              <Route path="/teacher/gradebook/:subjectId" element={<Gradebook />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/advisory-class" element={<AdvisoryClass />} />
              <Route path="/teacher/advisory-class/sf9/:studentId" element={<ExportReportCardPDF />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/accounts" element={<AccountListPage />} />
              <Route path="/admin/accounts/create/teacher" element={<CreateTeacherAccountPage />} />
              <Route path="/admin/accounts/create/student" element={<CreateStudentAccountPage />} />
              <Route path="/admin/accounts/create/admin" element={<CreateAdminAccountPage />} />
              <Route path="/admin/faculty" element={<FacultyPage />} />
              <Route path="/admin/faculty/:department" element={<FacultyList />} />
              <Route path="/admin/students" element={<StudentAccountsPage />} />
              <Route path="/admin/students/add-section" element={<CreateSubjectPage />} />
              <Route path="/admin/students/:sectionId" element={<StudentClassList />} />
              <Route path="/admin/gradelogs" element={<GradeLogs />} />
            </Route>

          </Route>
        </Route>

        {/* 4. Global Redirect */}
        <Route
          path="/"
          element={
            !user
              ? <Navigate to="/login" replace />
              : user.role
                ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
                : <Navigate to="/login" replace />
          }
        />

        {/* 404 */}
        <Route path="*" element={<div className="p-10 text-center">404: Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
