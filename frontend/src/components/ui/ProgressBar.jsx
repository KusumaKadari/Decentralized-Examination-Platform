export default function ProgressBar({
    value = 0,
    max = 100,
    variant = 'primary',
    showLabel = false,
    className = ''
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const variantClasses = {
        primary: 'bg-primary-500',
        success: 'bg-success-500',
        danger: 'bg-danger-500',
        warning: 'bg-warning-500',
    }

    return (
        <div className={className}>
            <div className="relative h-2.5 bg-dark-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${variantClasses[variant]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="text-sm text-dark-600 mt-1">
                    {Math.round(percentage)}%
                </p>
            )}
        </div>
    )
}
