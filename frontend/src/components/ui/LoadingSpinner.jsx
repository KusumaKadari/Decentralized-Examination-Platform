export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <svg
                className={`animate-spin text-primary-600 ${sizeClasses[size]}`}
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    )
}

export function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 bg-dark-900/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-dark-600 font-medium">{message}</p>
            </div>
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    )
}
