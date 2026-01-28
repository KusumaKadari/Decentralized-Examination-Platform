export default function Alert({
    children,
    variant = 'info',
    title,
    onClose,
    className = ''
}) {
    const variantStyles = {
        success: {
            bg: 'bg-success-50',
            border: 'border-success-500',
            text: 'text-success-600',
            icon: '✓',
        },
        danger: {
            bg: 'bg-danger-50',
            border: 'border-danger-500',
            text: 'text-danger-600',
            icon: '✕',
        },
        warning: {
            bg: 'bg-warning-50',
            border: 'border-warning-500',
            text: 'text-warning-600',
            icon: '⚠',
        },
        info: {
            bg: 'bg-primary-50',
            border: 'border-primary-500',
            text: 'text-primary-600',
            icon: 'ℹ',
        },
    }

    const style = variantStyles[variant]

    return (
        <div
            className={`
        ${style.bg} ${style.text}
        border-l-4 ${style.border}
        p-4 rounded-r-lg animate-fade-in
        ${className}
      `}
            role="alert"
        >
            <div className="flex items-start">
                <span className="text-lg mr-3">{style.icon}</span>
                <div className="flex-1">
                    {title && <p className="font-semibold">{title}</p>}
                    <p className={title ? 'mt-1' : ''}>{children}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-lg hover:opacity-70 transition-opacity"
                        aria-label="Close"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    )
}
