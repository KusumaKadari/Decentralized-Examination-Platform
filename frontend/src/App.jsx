import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AddUser from './pages/admin/AddUser'
import AdminViewQuestions from './pages/admin/ViewQuestions'
import AdminViewMarks from './pages/admin/ViewMarks'
import AdminManageTests from './pages/admin/ManageTests'

import TeacherLogin from './pages/teacher/Login'
import TeacherDashboard from './pages/teacher/Dashboard'
import AddQuestion from './pages/teacher/AddQuestion'
import CreateTest from './pages/teacher/CreateTest'
import TeacherManageTests from './pages/teacher/ManageTests'
import TeacherViewMarks from './pages/teacher/ViewMarks'
import EditTest from './pages/teacher/EditTest'
import ViewTestDetails from './pages/teacher/ViewTestDetails'

import StudentLogin from './pages/student/Login'
import StudentDashboard from './pages/student/Dashboard'
import SelectTest from './pages/student/SelectTest'
import WriteExam from './pages/student/WriteExam'
import StudentViewMarks from './pages/student/ViewMarks'

// Protected Route component
function ProtectedRoute({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user?.user_type)) {
        return <Navigate to="/" replace />
    }

    return children
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/student/login" element={<StudentLogin />} />

            {/* Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/add-user"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AddUser />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/questions"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminViewQuestions />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/marks"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminViewMarks />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/tests"
                element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminManageTests />
                    </ProtectedRoute>
                }
            />

            {/* Teacher Routes */}
            <Route
                path="/teacher/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/add-question"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <AddQuestion />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/create-test"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <CreateTest />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/tests"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <TeacherManageTests />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/marks"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <TeacherViewMarks />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/edit-test/:testIndex"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <EditTest />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teacher/test-details/:testIndex"
                element={
                    <ProtectedRoute allowedRoles={['Teacher']}>
                        <ViewTestDetails />
                    </ProtectedRoute>
                }
            />

            {/* Student Routes */}
            <Route
                path="/student/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['Student']}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/select-test"
                element={
                    <ProtectedRoute allowedRoles={['Student']}>
                        <SelectTest />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/exam"
                element={
                    <ProtectedRoute allowedRoles={['Student']}>
                        <WriteExam />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/marks"
                element={
                    <ProtectedRoute allowedRoles={['Student']}>
                        <StudentViewMarks />
                    </ProtectedRoute>
                }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
