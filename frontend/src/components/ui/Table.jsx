export default function Table({ children, className = '' }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-dark-200">
            <table className={`w-full text-left ${className}`}>
                {children}
            </table>
        </div>
    )
}

export function TableHeader({ children, className = '' }) {
    return (
        <thead className={`bg-dark-50 border-b border-dark-200 ${className}`}>
            {children}
        </thead>
    )
}

export function TableBody({ children, className = '' }) {
    return (
        <tbody className={`bg-white divide-y divide-dark-100 ${className}`}>
            {children}
        </tbody>
    )
}

export function TableRow({ children, className = '', onClick }) {
    return (
        <tr
            onClick={onClick}
            className={`
        hover:bg-dark-50 transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </tr>
    )
}

export function TableHead({ children, className = '' }) {
    return (
        <th className={`px-4 py-3 text-sm font-semibold text-dark-600 ${className}`}>
            {children}
        </th>
    )
}

export function TableCell({ children, className = '' }) {
    return (
        <td className={`px-4 py-3 text-sm text-dark-700 ${className}`}>
            {children}
        </td>
    )
}
