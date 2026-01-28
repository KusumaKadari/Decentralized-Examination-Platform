import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await authAPI.login(username, password, 'Admin')
            if (response.data.success) {
                login(response.data.user)
                navigate('/admin/dashboard')
            } else {
                setError(response.data.error || 'Invalid credentials')
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-gray-900 z-10" />

                {/* Abstract Shapes */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl opacity-50" />

                <div className="relative z-20 p-12 text-white max-w-lg">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-primary-900/50 mb-8 border border-primary-500/30">
                        🛡️
                    </div>
                    <h1 className="text-4xl font-bold mb-6 tracking-tight leading-tight">
                        Secure Decentralized <br />
                        Examination Platform
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Next-generation assessment infrastructure powered by Blockchain and IPFS technology. Ensuring absolute integrity and transparency.
                    </p>

                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                        <div className="flex -space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs text-white">Eth</div>
                            <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-white">IPFS</div>
                            <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-xs text-white">SEC</div>
                        </div>
                        <span>Enterprise Grade Security</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-12 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Website
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            Admin Portal
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Please enter your credentials to access the dashboard.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Admin ID
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full py-4 text-lg font-bold rounded-xl shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 bg-gray-900 hover:bg-gray-800 text-white transition-all transform hover:-translate-y-0.5 border-none"
                        >
                            Log In to Dashboard
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-gray-400 text-sm">
                        Restricted Access. Authorized personnel only.
                    </p>
                </div>
            </div>
        </div>
    )
}
