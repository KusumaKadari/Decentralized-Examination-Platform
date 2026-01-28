export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        p-6 transition-shadow duration-200 hover:shadow-md
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
            {children}
        </h3>
    )
}

export function CardDescription({ children, className = '' }) {
    return (
        <p className={`text-gray-500 text-sm mt-1 ${className}`}>
            {children}
        </p>
    )
}

export function CardContent({ children, className = '' }) {
    return <div className={className}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    )
}
