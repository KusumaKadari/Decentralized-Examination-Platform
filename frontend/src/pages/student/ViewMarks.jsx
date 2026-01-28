import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { resultsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import ExamReportModal from '../../components/ui/ExamReportModal'

export default function StudentViewMarks() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    // Modal state
    const [reportModal, setReportModal] = useState({
        isOpen: false,
        student: '',
        testId: '',
        testName: ''
    })

    useEffect(() => {
        loadResults()
    }, [])

    const loadResults = async () => {
        setLoading(true)
        try {
            const response = await resultsAPI.list({ filter_student: user?.username })
            setResults(response.data.results || [])
        } catch (err) {
            console.error('Failed to load results:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewAnswerKey = (result) => {
        setReportModal({
            isOpen: true,
            student: user.username,
            testId: result.test,
            testName: result.test
        })
    }

    return (
        <DashboardLayout title="My Results">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-dark-800">
                        Exam History
                    </h2>
                    <Badge variant="primary">{results.length} Exams</Badge>
                </div>

                {loading ? (
                    <PageLoader />
                ) : results.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">🏆</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Results Yet</h3>
                        <p className="text-dark-500 mt-1">
                            Complete an exam to see your performance here.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Number</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{result.test}</TableCell>
                                    <TableCell>{result.correct} / {result.total}</TableCell>
                                    <TableCell>
                                        <div className="w-32">
                                            <ProgressBar
                                                value={result.percentage}
                                                variant={result.passed ? 'success' : 'danger'}
                                                showLabel
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={result.passed ? 'success' : 'danger'}>
                                            {result.passed ? 'Pass' : 'Fail'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-dark-500">{result.teacher}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleViewAnswerKey(result)}
                                        >
                                            View Report
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <ExamReportModal
                isOpen={reportModal.isOpen}
                onClose={() => setReportModal({ ...reportModal, isOpen: false })}
                studentUsername={reportModal.student}
                testId={reportModal.testId}
                testName={reportModal.testName}
                viewerRole="Student"
            />
        </DashboardLayout>
    )
}
