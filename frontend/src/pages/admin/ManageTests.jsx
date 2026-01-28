import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Alert from '../../components/ui/Alert'
import { testsAPI } from '../../api/api'

export default function ManageTests() {
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadTests()
    }, [])

    const loadTests = async () => {
        try {
            const response = await testsAPI.list()
            setTests(response.data.tests || [])
        } catch (err) {
            console.error('Failed to load tests:', err)
            setError('Failed to load tests.')
        } finally {
            setLoading(false)
        }
    }

    // Admin usually views all tests but deletion depends on backend permission.
    // The original Django code allows AdminManageTests to view all, but AdminDeleteTest view exists.
    // We'll assume Admin can delete any test or view them.
    // The API delete_test checks if teacher provided matches. If I am admin, maybe I can delete?
    // The backend constraint: if teacher param is sent, it checks ownership. If not sent?
    // Let's look at backend `delete_test`: "if teacher and test['teacher'] != teacher" -> forbidden.
    // So if I don't send teacher param, it might allow deletion if I am authenticated?
    // The auth middleware allows any. The backend logic relies on `teacher` query param availability.
    // Ideally, for Admin, we might want to delete any test. Let's see if UI allows it.

    // Implementation note: The original AdminDeleteTest (view.py) just takes index.
    // My new API `delete_test` also takes index and optional teacher.
    // So as Admin, I can call delete without teacher param.

    const handleDelete = async (index, testNumber) => {
        if (!window.confirm(`Are you sure you want to delete test "${testNumber}"?`)) return

        try {
            await testsAPI.delete(index) // No teacher param for admin
            setTests(tests.filter((_, i) => i !== index))
        } catch (err) {
            alert('Failed to delete test')
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Manage Tests">
                <PageLoader />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Manage Tests">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-dark-800">
                        All Tests
                    </h2>
                    <Badge variant="primary">{tests.length} Tests</Badge>
                </div>

                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {tests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Tests Created</h3>
                        <p className="text-dark-500 mt-1">
                            Teachers haven't created any tests yet
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Number</TableHead>
                                <TableHead>Teacher</TableHead>
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
                                    <TableCell>{test.teacher}</TableCell>
                                    <TableCell>{test.num_questions}</TableCell>
                                    <TableCell>{test.duration} mins</TableCell>
                                    <TableCell>{test.pass_percentage}%</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(test.index, test.test_number)}
                                        >
                                            Delete
                                        </Button>
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
