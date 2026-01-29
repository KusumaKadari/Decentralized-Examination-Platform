import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Alert from '../../components/ui/Alert'
import { testsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function ViewTestDetails() {
    const { testIndex } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [test, setTest] = useState(null)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadTestDetails()
    }, [testIndex])

    const loadTestDetails = async () => {
        try {
            const response = await testsAPI.get(testIndex)
            if (response.data.success) {
                setTest(response.data.test)
                setQuestions(response.data.questions || [])
            } else {
                setError(response.data.error || 'Failed to load test details')
            }
        } catch (err) {
            console.error('Failed to load test:', err)
            setError('Failed to load test details. You may not be authorized.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Test Details">
                <PageLoader />
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout title="Test Details">
                <Alert variant="danger">{error}</Alert>
                <div className="mt-4">
                    <Button variant="secondary" onClick={() => navigate('/teacher/tests')}>
                        Back to Tests
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={`Test Details: ${test?.test_number}`}>
            <Card className="mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{test?.test_number}</h2>
                        <p className="text-gray-500">Created by {test?.teacher}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={test?.status === 'active' ? 'success' : 'secondary'}>
                            {test?.status}
                        </Badge>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/teacher/tests')}>
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <div className="text-sm text-gray-500">Questions</div>
                        <div className="text-lg font-semibold">{test?.num_questions}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="text-lg font-semibold">{test?.duration} mins</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Pass %</div>
                        <div className="text-lg font-semibold">{test?.pass_percentage}%</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Marks</div>
                        <div className="text-lg font-semibold">{test?.num_questions}</div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Answer Key</h3>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead>Correct Answer</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.map((q, i) => (
                            <TableRow key={i}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell className="max-w-md font-medium text-gray-800">
                                    {q.question}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm space-y-1 text-gray-600">
                                        <div>A: {q.option_a}</div>
                                        <div>B: {q.option_b}</div>
                                        <div>C: {q.option_c}</div>
                                        <div>D: {q.option_d}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-bold text-success-600 uppercase bg-success-50 px-3 py-1 rounded inline-block">
                                        {q.correct_answer}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </DashboardLayout>
    )
}
