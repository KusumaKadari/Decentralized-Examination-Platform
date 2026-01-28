import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TopNavbar({ title }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className="bg-white border-b border-dark-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Title */}
                    <div className="flex items-center">
                        <h2 className="text-lg sm:text-xl font-semibold text-dark-800 ml-12 lg:ml-0">
                            {title || 'Decentralized Examination Platform'}
                        </h2>
                    </div>

                    {/* User info and logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-semibold text-sm">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-dark-800">{user?.username}</p>
                                <p className="text-dark-500 text-xs">{user?.user_type}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary btn-sm"
                        >
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
