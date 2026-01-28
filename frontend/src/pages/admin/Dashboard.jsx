import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
    const { user } = useAuth()

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
