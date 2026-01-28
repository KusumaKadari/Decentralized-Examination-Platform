import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { testsAPI, examsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function SelectTest() {
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
            setTests(response.data.tests || [])
        } catch (err) {
            console.error('Failed to load tests:', err)
            setError('Failed to load available tests.')
        } finally {
            setLoading(false)
        }
    }

    const handleStartExam = async (testIndex) => {
        try {
            // Check eligibility (if already taken)
            // The API `select_test` endpoint does this check.
            // But it returns questions if allowed, or error/redirect if not.
            // We can call it here to verify, or just navigate and let WriteExam handle fetch.
            // Let's call it to preemptively check and get data.

            const response = await examsAPI.selectTest(testIndex, user.username)

            if (response.data.error) {
                setError(response.data.error)
                return
            }

            // If successful, navigate to exam page with test data
            navigate('/student/exam', {
                state: {
                    testData: {
                        ...response.data,
                        index: testIndex // Ensure index is passed for submission
                    }
                }
            })

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to start exam. You may have already attempted it.')
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Select Test">
                <PageLoader />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Select Test">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-dark-800">
                        Available Tests
                    </h2>
                    <Badge variant="warning">{tests.length} Tests</Badge>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {tests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Tests Available</h3>
                        <p className="text-dark-500 mt-1">
                            Please check back later for scheduled exams.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Number</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tests.map((test, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{test.test_number}</TableCell>
                                    <TableCell>{test.teacher}</TableCell>
                                    <TableCell>{test.duration || 60} mins</TableCell>
                                    <TableCell>{test.num_questions}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleStartExam(test.index)}
                                        >
                                            Start Exam
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
