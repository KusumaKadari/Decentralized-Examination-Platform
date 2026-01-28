import { forwardRef } from 'react'

const Input = forwardRef(function Input(
    {
        label,
        error,
        helperText,
        type = 'text',
        required = false,
        className = '',
        ...props
    },
    ref
) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                className={`
          w-full px-4 py-2.5 border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all duration-200 bg-white
          ${error
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-dark-300 focus:ring-primary-500'
                    }
          ${className}
        `}
                {...props}
            />
            {(error || helperText) && (
                <p
                    className={`mt-1.5 text-sm ${error ? 'text-danger-500' : 'text-dark-500'
                        }`}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    )
})

export default Input
