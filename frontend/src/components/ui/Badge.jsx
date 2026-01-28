export default function Badge({ children, variant = 'primary', className = '' }) {
    const variantClasses = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-success-50 text-success-600',
        danger: 'bg-danger-50 text-danger-600',
        warning: 'bg-warning-50 text-warning-600',
    }

    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    )
}
