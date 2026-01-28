import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    // Check for stored auth on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
                setIsAuthenticated(true)
            } catch (e) {
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const login = (userData) => {
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('user')
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
