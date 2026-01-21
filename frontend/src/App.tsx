import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage.tsx';

import ProtectedRoute from './ProtectedRoute.tsx';
import { Unauthorized } from './pages/auth/Unauthorized.tsx';
import Layout from '../src/components/Layout.tsx'; // Import your new Layout
import { useAuth } from '../src/context/AuthContext.tsx'; // Import your auth hook

// student imports
import SubjectsPage from './pages/student/subjects/student-subjects.tsx';
import GradesPage from './pages/student/gradebook/student-grades.tsx';
import { StudentSubmissions } from './pages/student/submission/StudentSubmissions.tsx';
<<<<<<< HEAD
import { StudentDashboard } from './pages/student/dashboard/studentdashboard.tsx';
=======

>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
import  StudentSubjectpage  from './pages/student/subjects/student-subjects-id.tsx';

// teacher imports


import TeacherSubmissions  from './pages/teacher/submissions/TeacherSubmissions.tsx';
import AdvisoryClass from './pages/teacher/advisoryClass/AdvisoryClass.tsx';
import  TeacherDashboard  from './pages/teacher/dashboard/TeacherDashboard.tsx';

// admin imports
import AdminDashboard from './pages/admin/dasboard/AdminDashboard.tsx';
import { FacultyList } from './pages/admin/faculty/departmentId.tsx';
import { StudentClassList } from './pages/admin/students/Student_classlist.tsx';
// import SectionsPage from './pages/admin/section/SectionPage.tsx';
import { FacultyPage } from './pages/admin/faculty/FacultyPage.tsx';
import { StudentAccountsPage} from './pages/admin/students/StudentsPage.tsx';
import GradeLogs from './pages/admin/gradelogs/GradeLogs.tsx';
import AccountListPage from './pages/admin/accounts/Account-list.tsx';
import CreateSubjectPage from './pages/admin/students/addFacultyMember.tsx';

import Gradebook from './pages/teacher/gradebook/GradeBook.tsx';
<<<<<<< HEAD
=======
import QuarterlyGradesPage from './pages/teacher/gradebook/QuarterlyGradesPage.tsx';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
import ExportReportCardPDF from './pages/teacher/advisoryClass/SF9.tsx';
// import SubjectPage from './pages/teacher/subjects/SubjectPage.tsx';
import SubjectListPage from './pages/teacher/subjects/subject.tsx';
import SubjectCreationForm from './pages/teacher/subjects/create-subject.tsx';
import SubjectProvider from './pages/teacher/subjects/SubjectProvider.tsx';
import SubjectPage from './pages/teacher/subjects/SubjectPage.tsx';
import CreateTeacherAccountPage from './pages/admin/accounts/create-accounts/Create-teacher-account.tsx';
import CreateStudentAccountPage from './pages/admin/accounts/create-accounts/Create-student-account.tsx';
import CreateAdminAccountPage from './pages/admin/accounts/create-accounts/Create-admin-account.tsx';
import CreateFacultyPage from './pages/admin/faculty/createFaculty.tsx';
import SubmissionReport from './pages/admin/submissions/report.tsx';
<<<<<<< HEAD

=======
import StudentDashboard from './pages/student/dashboard/StudentDashboard.tsx';
import SubjectAnalytics from './pages/teacher/analytics/SubjectAnalytics.tsx';

// Quiz imports
import TeacherQuizList from './pages/teacher/quiz/TeacherQuizList.tsx';
import CreateQuiz from './pages/teacher/quiz/CreateQuiz.tsx';
import ManageQuiz from './pages/teacher/quiz/ManageQuiz.tsx';
import QuizItemAnalysis from './pages/teacher/quiz/QuizItemAnalysis.tsx';
import StudentQuizList from './pages/student/quiz/StudentQuizList.tsx';
import TakeQuiz from './pages/student/quiz/TakeQuiz.tsx';
import QuizResult from './pages/student/quiz/QuizResult.tsx';
import StudentGradeForecast from './pages/student/gradeForecast/StudentGradeForecast.tsx';
import StudentQuarterlyGrades from './pages/student/grades/StudentQuarterlyGrades.tsx';
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f


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
              <Route path="/student/subject" element={<SubjectsPage />} />
              <Route path="/student/subject/:id" element={<StudentSubjectpage />} />
              <Route path="/student/gradebook" element={<GradesPage />} />
<<<<<<< HEAD
              <Route path="/student/submissions" element={<StudentSubmissions />} />
=======
              <Route path="/student/grades/quarterly" element={<StudentQuarterlyGrades />} />
              <Route path="/student/submissions" element={<StudentSubmissions />} />
              <Route path="/student/quiz" element={<StudentQuizList />} />
              <Route path="/student/quiz/:id/take" element={<TakeQuiz />} />
              <Route path="/student/quiz/result" element={<QuizResult />} />
              <Route path="/student/grade-forecast" element={<StudentGradeForecast />} />
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
              {/* You can add more student pages here like /student/grades */}
            </Route>

            {/* Teacher Domain */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route element={<SubjectProvider />}>
                {/* Subject Routes */}
                <Route path='teacher/subject'>
                  {/* Renders the list of subjects */}
                  <Route index element={<SubjectListPage />} /> 
                  
                  {/* Renders the form for creating a new subject */}
                  <Route path='create-subject' element={<SubjectCreationForm />} />
                  
                  {/* Renders the detail page for a specific subject */}
                  <Route path=':id' element={<SubjectPage />} />

                  {/* Nested activity routes for a specific subject */}
                  {/* <Route path=':id/assignment' element={<CreateAssignment />}/>
                  <Route path=':id/quiz' element={<QuizBuilder />}/>
                  <Route path=':id/exam' element={<Exam />}/>
                  <Route path=':id/files' element={<SubjectFilesPage />}/>
                  <Route path=':id/activities' element={<ActivityPage />}/> */}
                </Route>
              </Route>
<<<<<<< HEAD
              <Route path="/teacher/gradebook" element={<Gradebook />} />
              <Route path="/teacher/gradebook/:subjectId" element={<Gradebook />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/advisory-class" element={<AdvisoryClass />} />
              <Route path="/teacher/advisory-class/sf9/:studentId" element={<ExportReportCardPDF />} />
=======
              <Route path='/teacher/analytics' element={<SubjectAnalytics />} />
              <Route path="/teacher/gradebook" element={<Gradebook />} />
              <Route path="/teacher/gradebook/:subjectId" element={<Gradebook />} />
              <Route path="/teacher/grades/quarterly" element={<QuarterlyGradesPage />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/advisory-class" element={<AdvisoryClass />} />
              <Route path="/teacher/advisory-class/sf9/:studentId" element={<ExportReportCardPDF />} />
              <Route path="/teacher/quiz" element={<TeacherQuizList />} />
              <Route path="/teacher/quiz/create" element={<CreateQuiz />} />
              <Route path="/teacher/quiz/:id" element={<ManageQuiz />} />
              <Route path="/teacher/quiz/:id/item-analysis" element={<QuizItemAnalysis />} />
>>>>>>> b86c2354adfddee38bfd4181b1797539de1d863f
              

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
              <Route path="/admin/students/add-section" element={<CreateSubjectPage />} />
              <Route path="/admin/students/:sectionId" element={<StudentClassList />} />
              <Route path="/admin/submission" element={<SubmissionReport />} />
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