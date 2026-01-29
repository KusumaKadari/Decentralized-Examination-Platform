import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { questionsAPI } from '../../api/api'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [teacherStats, setTeacherStats] = useState({})
    const [loadingQuestions, setLoadingQuestions] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const response = await questionsAPI.list()
            const questions = response.data.questions || []

            // Group by teacher
            const stats = {}
            questions.forEach(q => {
                const teacher = q.teacher || 'Unknown'
                stats[teacher] = (stats[teacher] || 0) + 1
            })
            setTeacherStats(stats)
        } catch (err) {
            console.error('Failed to load stats:', err)
        } finally {
            setLoadingQuestions(false)
        }
    }

    const actionCards = [
        {
            title: 'Add Users',
            description: 'Add new teachers or students to the system',
            icon: '👥',
            path: '/admin/add-user',
            color: 'primary',
        },
        {
            title: 'View Questions',
            description: 'View all exam questions stored in IPFS',
            icon: '📝',
            path: '/admin/questions',
            color: 'success',
        },
        {
            title: 'Manage Tests',
            description: 'View and manage all created tests',
            icon: '⚙️',
            path: '/admin/tests',
            color: 'warning',
        },
        {
            title: 'View Marks',
            description: 'View student exam results and performance',
            icon: '📊',
            path: '/admin/marks',
            color: 'danger',
        },
    ]

    return (
        <DashboardLayout title="Admin Dashboard">
            {/* Welcome Section */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    System Administration
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Overview of system performance and user management.
                </p>
            </div>

            {/* Action Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {actionCards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.path}
                        className="group"
                    >
                        <Card className="h-full hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                {card.description}
                            </p>
                        </Card>
                    </Link>
                ))}
            </div>


            {/* Questions by Teacher Section */}
            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">
                    Questions by Teacher
                </h3>
                {loadingQuestions ? (
                    <div className="text-gray-500">Loading stats...</div>
                ) : Object.keys(teacherStats).length === 0 ? (
                    <div className="text-gray-500">No questions found.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(teacherStats).map(([teacher, count]) => (
                            <Link
                                key={teacher}
                                to={`/admin/questions?teacher=${teacher}`}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
                                        👨‍🏫
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{teacher}</div>
                                        <div className="text-xs text-gray-500">Teacher ID</div>
                                    </div>
                                </div>
                                <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {count} Qs
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-50 rounded-lg text-2xl">🔒</div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                            Blockchain Secured Infrastructure
                        </h3>
                        <p className="text-gray-500 mt-1 leading-relaxed">
                            System integrity is maintained via immutable ledger records on the Ethereum blockchain. Question data is decentralized across IPFS nodes to prevent single-point failures and unauthorized tampering.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
