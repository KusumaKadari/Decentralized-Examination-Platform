import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { usersAPI } from '../../api/api'

export default function AddUser() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: '',
        email: '',
        user_type: 'Teacher',
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const response = await usersAPI.create(formData)
            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message })
                setFormData({
                    username: '',
                    password: '',
                    phone: '',
                    email: '',
                    user_type: 'Teacher',
                })
            } else {
                setMessage({ type: 'danger', text: response.data.error })
            }
        } catch (err) {
            setMessage({
                type: 'danger',
                text: err.response?.data?.error || 'Failed to add user. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Add User">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardTitle>Add New User</CardTitle>
                    <CardDescription>
                        Add a new teacher or student details
                    </CardDescription>

                    {message && (
                        <Alert
                            variant={message.type}
                            className="mt-4"
                            onClose={() => setMessage(null)}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                    Username <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                    Password <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                User Type <span className="text-danger-500">*</span>
                            </label>
                            <select
                                name="user_type"
                                value={formData.user_type}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>

                        <Button type="submit" loading={loading} className="w-full">
                            Add User
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    )
}
