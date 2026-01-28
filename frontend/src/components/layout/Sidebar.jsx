import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ items, userType }) {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Mobile toggle button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-gray-100 text-gray-600"
                aria-label="Toggle menu"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50
          transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* Logo/Header */}
                <div className="h-20 flex items-center px-8 border-b border-gray-50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-primary-600/20">
                            D
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
                                Decentralized
                            </h1>
                            <p className="text-xs text-primary-600 font-semibold tracking-wide uppercase mt-0.5">
                                {userType} Portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 mt-4">
                    {items.map((item, index) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                    }
                `}
                            >
                                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-600">System Operational</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                            Secured by Blockchain & IPFS technology.
                            <br />v2.0.0 Enterprise Build
                        </p>
                    </div>
                </div>
            </aside>
        </>
    )
}
