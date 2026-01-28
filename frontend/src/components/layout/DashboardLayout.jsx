import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import { useAuth } from '../../context/AuthContext'

// Navigation items for each role
const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/add-user', label: 'Add Users', icon: '👥' },
    { path: '/admin/questions', label: 'View Questions', icon: '📝' },
    { path: '/admin/tests', label: 'Manage Tests', icon: '⚙️' },
    { path: '/admin/marks', label: 'View Marks', icon: '📊' },
]

const teacherNavItems = [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/teacher/add-question', label: 'Add Questions', icon: '➕' },
    { path: '/teacher/create-test', label: 'Create Test', icon: '📋' },
    { path: '/teacher/tests', label: 'Manage Tests', icon: '⚙️' },
    { path: '/teacher/marks', label: 'View Marks', icon: '📊' },
]

const studentNavItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/student/select-test', label: 'Write Exam', icon: '📝' },
    { path: '/student/marks', label: 'View Marks', icon: '📊' },
]

export default function DashboardLayout({ children, title }) {
    const { user } = useAuth()

    // Get nav items based on user role
    const getNavItems = () => {
        switch (user?.user_type) {
            case 'Admin':
                return adminNavItems
            case 'Teacher':
                return teacherNavItems
            case 'Student':
                return studentNavItems
            default:
                return []
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar items={getNavItems()} userType={user?.user_type} />

            {/* Main content area */}
            <div className="lg:ml-72 min-h-screen transition-all duration-300">
                {/* Top navbar */}
                <TopNavbar title={title} />

                {/* Page content */}
                <main className="p-6 lg:p-10">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
