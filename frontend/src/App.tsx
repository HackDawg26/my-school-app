import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage.tsx';

import ProtectedRoute from './ProtectedRoute.tsx';
import { Unauthorized } from './pages/auth/Unauthorized.tsx';
import Layout from '../src/components/Layout.tsx';
import { useAuth } from '../src/context/AuthContext.tsx';

// student imports
import SubjectsPage from './pages/student/subjects/student-subjects.tsx';
<<<<<<< HEAD
import GradesPage from './pages/student/gradebook/student-grades.tsx';
import { StudentSubmissions } from './pages/student/submission/StudentSubmissions.tsx';
import StudentDashboard from './pages/student/dashboard/StudentDashboard.tsx';
import StudentSubjectpage from './pages/student/subjects/student-subjects-id.tsx';
import StudentGradeForecast from './pages/student/gradeForecast/StudentGradeForecast.tsx';
import StudentQuarterlyGrades from './pages/student/grades/StudentQuarterlyGrades.tsx';

// teacher imports
import TeacherSubmissions from './pages/teacher/submissions/TeacherSubmissions.tsx';
=======
import  StudentSubjectpage  from './pages/student/subjects/student-subjects-id.tsx';

// teacher imports


>>>>>>> Backup
import AdvisoryClass from './pages/teacher/advisoryClass/AdvisoryClass.tsx';
import TeacherDashboard from './pages/teacher/dashboard/TeacherDashboard.tsx';

import Gradebook from './pages/teacher/gradebook/GradeBook.tsx';
import QuarterlyGradesPage from './pages/teacher/gradebook/QuarterlyGradesPage.tsx';

import ExportReportCardPDF from './pages/teacher/advisoryClass/SF9.tsx';
import SubjectListPage from './pages/teacher/subjects/subject.tsx';
import SubjectCreationForm from './pages/teacher/subjects/create-subject.tsx';
import SubjectProvider from './pages/teacher/subjects/SubjectProvider.tsx';
import SubjectPage from './pages/teacher/subjects/SubjectPage.tsx';

import SubjectAnalytics from './pages/teacher/analytics/SubjectAnalytics.tsx';

// Quiz imports
import TeacherQuizList from './pages/teacher/quiz/TeacherQuizList.tsx';
import CreateQuiz from './pages/teacher/quiz/CreateQuiz.tsx';
import ManageQuiz from './pages/teacher/quiz/ManageQuiz.tsx';
import QuizItemAnalysis from './pages/teacher/quiz/QuizItemAnalysis.tsx';
import StudentQuizList from './pages/student/quiz/StudentQuizList.tsx';
import TakeQuiz from './pages/student/quiz/TakeQuiz.tsx';
import QuizResult from './pages/student/quiz/QuizResult.tsx';

// admin imports
import AdminDashboard from './pages/admin/dasboard/AdminDashboard.tsx';
import { FacultyList } from './pages/admin/faculty/departmentId.tsx';
import { StudentClassList } from './pages/admin/students/Student_classlist.tsx';
import { FacultyPage } from './pages/admin/faculty/FacultyPage.tsx';
import { StudentAccountsPage } from './pages/admin/students/StudentsPage.tsx';
import GradeLogs from './pages/admin/gradelogs/GradeLogs.tsx';
import AccountListPage from './pages/admin/accounts/Account-list.tsx';

import CreateTeacherAccountPage from './pages/admin/accounts/create-accounts/Create-teacher-account.tsx';
import CreateStudentAccountPage from './pages/admin/accounts/create-accounts/Create-student-account.tsx';
import CreateAdminAccountPage from './pages/admin/accounts/create-accounts/Create-admin-account.tsx';

import CreateFacultyPage from './pages/admin/faculty/createFaculty.tsx';
import SubmissionReport from './pages/admin/submissions/report.tsx';

// keep ONLY ONE component for this route
import CreateSectionPage from './pages/admin/students/create-subject.tsx';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected App Area */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']} />}>
          <Route element={<Layout />}>
            {/* Student Domain */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/subject" element={<SubjectsPage />} />
<<<<<<< HEAD
              <Route path="/student/subject/:id" element={<StudentSubjectpage />} />
              <Route path="/student/gradebook" element={<GradesPage />} />

              <Route path="/student/submissions" element={<StudentSubmissions />} />
              <Route path="/student/grades/quarterly" element={<StudentQuarterlyGrades />} />

=======
              <Route path="/student/subject-offering/:id" element={<StudentSubjectpage />} />
              <Route path="/student/grades/quarterly" element={<StudentQuarterlyGrades />} />
>>>>>>> Backup
              <Route path="/student/quiz" element={<StudentQuizList />} />
              <Route path="/student/quiz/:id/take" element={<TakeQuiz />} />
              <Route path="/student/quiz/result" element={<QuizResult />} />
              <Route path="/student/grade-forecast" element={<StudentGradeForecast />} />
            </Route>

            {/* Teacher Domain */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

              <Route element={<SubjectProvider />}>
                <Route path="/teacher/subject">
                  <Route index element={<SubjectListPage />} />
                  <Route path="create-subject" element={<SubjectCreationForm />} />
                  <Route path=":id" element={<SubjectPage />} />
                </Route>
              </Route>

              <Route path="/teacher/analytics" element={<SubjectAnalytics />} />

              <Route path="/teacher/gradebook" element={<Gradebook />} />
              <Route path="/teacher/gradebook/:subjectId" element={<Gradebook />} />
              <Route path="/teacher/grades/quarterly" element={<QuarterlyGradesPage />} />
<<<<<<< HEAD

              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
=======
>>>>>>> Backup
              <Route path="/teacher/advisory-class" element={<AdvisoryClass />} />
              <Route path="/teacher/advisory-class/sf9/:studentId" element={<ExportReportCardPDF />} />

              <Route path="/teacher/quiz" element={<TeacherQuizList />} />
              <Route path="/teacher/quiz/create" element={<CreateQuiz />} />
              <Route path="/teacher/quiz/:id" element={<ManageQuiz />} />
              <Route path="/teacher/quiz/:id/item-analysis" element={<QuizItemAnalysis />} />
            </Route>

            {/* Admin Domain */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/accounts" element={<AccountListPage />} />
              <Route path="/admin/accounts/create/teacher" element={<CreateTeacherAccountPage />} />
              <Route path="/admin/accounts/create/student" element={<CreateStudentAccountPage />} />
              <Route path="/admin/accounts/create/admin" element={<CreateAdminAccountPage />} />

              <Route path="/admin/faculty" element={<FacultyPage />} />
              <Route path="/admin/faculty/add-faculty" element={<CreateFacultyPage />} />
              <Route path="/admin/faculty/:department" element={<FacultyList />} />

              <Route path="/admin/students" element={<StudentAccountsPage />} />
              <Route path="/admin/students/add-section" element={<CreateSectionPage />} />
              <Route path="/admin/students/:sectionId" element={<StudentClassList />} />

              <Route path="/admin/submission" element={<SubmissionReport />} />
              <Route path="/admin/gradelogs" element={<GradeLogs />} />
            </Route>
          </Route>
        </Route>

        {/* Global Redirects */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<div className="p-10 text-center">404: Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
