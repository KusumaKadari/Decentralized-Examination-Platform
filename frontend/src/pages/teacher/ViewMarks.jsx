import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { resultsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ExamReportModal from '../../components/ui/ExamReportModal'

export default function TeacherViewMarks() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const [searchParams] = useSearchParams()

    // Modal state
    const [reportModal, setReportModal] = useState({
        isOpen: false,
        student: '',
        testId: '',
        testName: ''
    })

    const [filters, setFilters] = useState({
        test: searchParams.get('test') || '',
        filter_student: ''
    })

    useEffect(() => {
        loadResults()
    }, []) // Logic for search params is handled in initial state, but could re-trigger if params change dynamically

    const loadResults = async () => {
        setLoading(true)
        try {
            // Pass teacher filter to backend
            const response = await resultsAPI.list({
                ...filters,
                teacher: user?.username
            })
            setResults(response.data.results || [])
        } catch (err) {
            console.error('Failed to load results:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const handleSearch = (e) => {
        e.preventDefault()
        loadResults()
    }

    const openReportConfig = (result) => {
        setReportModal({
            isOpen: true,
            student: result.student,
            testId: result.test, // Assuming test ID/Number is available here
            testName: result.test
        })
    }

    return (
        <DashboardLayout title="View Student Marks">
            <Card className="mb-6">
                <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-4 items-end">
                    <Input
                        label="Test Number"
                        name="test"
                        value={filters.test}
                        onChange={handleFilterChange}
                        placeholder="Search your test..."
                    />
                    <Input
                        label="Student Name"
                        name="filter_student"
                        value={filters.filter_student}
                        onChange={handleFilterChange}
                        placeholder="Search student..."
                    />
                    <Button type="submit">Search</Button>
                </form>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-dark-800">
                        Exam Results
                    </h2>
                    <Badge variant="success">{results.length} Results</Badge>
                </div>

                {loading ? (
                    <PageLoader />
                ) : results.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Results</h3>
                        <p className="text-dark-500 mt-1">
                            No students have taken your tests yet, or check your filters.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Test Number</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Performance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{result.student}</TableCell>
                                    <TableCell>{result.test}</TableCell>
                                    <TableCell>
                                        <div className="font-semibold">
                                            {result.correct} / {result.total}
                                        </div>
                                    </TableCell>
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
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => openReportConfig(result)}
                                        >
                                            View Script
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
                viewerRole="Teacher"
            />
        </DashboardLayout>
    )
}
