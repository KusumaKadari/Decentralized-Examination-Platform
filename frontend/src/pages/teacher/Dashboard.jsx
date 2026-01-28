import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

export default function TeacherDashboard() {
    const { user } = useAuth()

    const actionCards = [
        {
            title: 'Add Questions',
            description: 'Add new questions to the IPFS question bank',
            icon: '➕',
            path: '/teacher/add-question',
            color: 'primary',
        },
        {
            title: 'Create Test',
            description: 'Create a new test from available questions',
            icon: '📋',
            path: '/teacher/create-test',
            color: 'success',
        },
        {
            title: 'Manage Tests',
            description: 'View and manage tests you created',
            icon: '⚙️',
            path: '/teacher/tests',
            color: 'warning',
        },
        {
            title: 'View Marks',
            description: 'View results for your conducted exams',
            icon: '📊',
            path: '/teacher/marks',
            color: 'danger',
        },
    ]

    return (
        <DashboardLayout title="Faculty Dashboard">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Welcome back, {user?.username}
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Manage your assessments and question banks from here.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {actionCards.map((card, index) => (
                    <Link key={index} to={card.path} className="group">
                        <Card className="h-full hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{card.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-8 p-6 bg-success-50 rounded-xl border border-success-100">
                <div className="flex items-start gap-4">
                    <span className="text-3xl">📝</span>
                    <div>
                        <h3 className="font-semibold text-success-800">Exam Management</h3>
                        <p className="text-success-700 text-sm mt-1">
                            Create comprehensive tests combining questions from various topics.
                            Results are automatically graded and stored securely.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
