import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/20">
                            D
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            Decentralized<span className="text-primary-600">Exams</span>
                        </span>
                    </div>
                    {/* Links removed as per user request */}
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-50 pt-20 pb-32 lg:pt-32 lg:pb-40">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-8 border border-primary-100">
                            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                            Next Generation Assessment Protocol
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                            The Future of <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                                Secure Assessments
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Enterprise-grade examination platform built on decentralized infrastructure. Ensuring absolute data integrity, zero downtime, and transparent verification for high-stakes testing.
                        </p>
                    </div>

                    {/* Portals Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
                        {/* Admin Portal */}
                        <Link to="/admin/login" className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Administrator</h3>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                System oversight, user management, and global configuration access for platform administrators.
                            </p>
                            <span className="inline-flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                                Access Portal <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                        </Link>

                        {/* Teacher Portal */}
                        <Link to="/teacher/login" className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Faculty</h3>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                Assessment creation, question bank management, and real-time performance analytics.
                            </p>
                            <span className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                                Faculty Login <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                        </Link>

                        {/* Student Portal */}
                        <Link to="/student/login" className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Candidate</h3>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                Secure examination environment with instant result verification and attempt history.
                            </p>
                            <span className="inline-flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                                Candidate Login <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-primary-50/50 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute top-1/2 -left-1/2 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl opacity-60"></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Tamper-Proof Integrity</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Leveraging cryptographic proofs to ensure that once an answer is submitted, it can never be altered or manipulated.
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">High Availability Infrastructure</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Distributed network architecture guarantees 99.99% uptime, ensuring exams proceed without interruption.
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Verifiable Credentials</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Instant, cryptographically verifiable results that allow third-party validation without compromising privacy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-12">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm">
                        © 2024 Decentralized Examination Platform. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <span className="hover:text-primary-600 cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-primary-600 cursor-pointer">Terms of Service</span>
                        <span className="hover:text-primary-600 cursor-pointer">Support</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
