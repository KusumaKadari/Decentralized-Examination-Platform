import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
    const { user } = useAuth()

    const actionCards = [
        {
            title: 'Write Exam',
            description: 'Select a test and start your examination',
            icon: '📝',
            path: '/student/select-test',
            color: 'warning',
        },
        {
            title: 'View Marks',
            description: 'Check results for completed exams',
            icon: '📊',
            path: '/student/marks',
            color: 'primary',
        },
    ]

    return (
        <DashboardLayout title="Student Portal">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Welcome back, {user?.username}
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Ready for your assessment? Select an option below.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {actionCards.map((card, index) => (
                    <Link key={index} to={card.path} className="group">
                        <Card className="h-full hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{card.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg text-2xl">⚠️</div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Examination Protocols</h3>
                        <div className="text-gray-500 text-sm mt-2 space-y-1.5 leading-relaxed">
                            <p>• Ensure a stable internet connection before beginning.</p>
                            <p>• Do not refresh or navigate away from the exam page.</p>
                            <p>• All submissions are final and recorded on the immutable ledger.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
