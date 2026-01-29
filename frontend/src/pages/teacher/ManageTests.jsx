import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Alert from '../../components/ui/Alert'
import { testsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function TeacherManageTests() {
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        loadTests()
    }, [])

    const loadTests = async () => {
        try {
            const response = await testsAPI.list()
            const allTests = response.data.tests || []
            // Client-side filter for teacher's own tests
            // Ideally API should support filtering, but list returns all.
            // We'll filter here for the view.
            const myTests = allTests.filter(t => t.teacher === user?.username)
            setTests(myTests)
        } catch (err) {
            console.error('Failed to load tests:', err)
            setError('Failed to load tests.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (index, testNumber) => {
        if (!window.confirm(`Are you sure you want to delete test "${testNumber}"?`)) return

        try {
            // Pass teacher username for backend validation
            await testsAPI.delete(index, user.username)
            setTests(tests.filter((t) => t.index !== index))
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete test')
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Manage My Tests">
                <PageLoader />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Manage My Tests">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-dark-800">
                        My Tests
                    </h2>
                    <Badge variant="success">{tests.length} Tests</Badge>
                </div>

                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {tests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Tests Created</h3>
                        <p className="text-dark-500 mt-1">
                            You haven't created any tests yet.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Number</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Pass %</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tests.map((test, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{test.test_number}</TableCell>
                                    <TableCell>{test.num_questions}</TableCell>
                                    <TableCell>{test.duration || 60} mins</TableCell>
                                    <TableCell>{test.pass_percentage || 50}%</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => navigate(`/teacher/test-details/${test.index}`)}
                                            >
                                                View Results
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => navigate(`/teacher/edit-test/${test.index}`)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(test.index, test.test_number)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </DashboardLayout>
    )
}
