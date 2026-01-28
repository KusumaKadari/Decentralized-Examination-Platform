import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { resultsAPI } from '../../api/api'

export default function ViewMarks() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        test: '',
        filter_student: '',
        teacher: ''
    })

    useEffect(() => {
        loadResults()
    }, [])

    const loadResults = async () => {
        setLoading(true)
        try {
            const response = await resultsAPI.list(filters)
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

    const handleClear = () => {
        setFilters({ test: '', filter_student: '', teacher: '' })
        // We need to trigger loadResults with empty filters, but state update is async.
        // So we pass empty object directly or use effect dependency if we wanted real-time search.
        // Here we'll just reload.
        // Actually, calling loadResults immediately uses stale state closure? 
        // No, functions inside component use current state if passed or ref.
        // Better to reload window or just call API with empty object.
        // Let's just reset form and let user click search, or auto-reload.
        // For simplicity:
        window.location.reload()
    }

    return (
        <DashboardLayout title="View Marks">
            <Card className="mb-6">
                <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4 items-end">
                    <Input
                        label="Test Number"
                        name="test"
                        value={filters.test}
                        onChange={handleFilterChange}
                        placeholder="Search test..."
                    />
                    <Input
                        label="Student Name"
                        name="filter_student"
                        value={filters.filter_student}
                        onChange={handleFilterChange}
                        placeholder="Search student..."
                    />
                    <Input
                        label="Teacher Name"
                        name="teacher"
                        value={filters.teacher}
                        onChange={handleFilterChange}
                        placeholder="Search teacher..."
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Search</Button>
                        <Button type="button" variant="secondary" onClick={handleClear}>Clear</Button>
                    </div>
                </form>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-dark-800">
                        Student Results
                    </h2>
                    <Badge variant="primary">{results.length} Results</Badge>
                </div>

                {loading ? (
                    <PageLoader />
                ) : results.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Results Found</h3>
                        <p className="text-dark-500 mt-1">
                            Try adjusting your filters or wait for exams to be completed
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Test</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Teacher</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{result.student}</TableCell>
                                    <TableCell>{result.test}</TableCell>
                                    <TableCell>
                                        <div className="min-w-[120px]">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>{result.correct}/{result.total}</span>
                                                <span>{result.percentage}%</span>
                                            </div>
                                            <ProgressBar
                                                value={result.percentage}
                                                variant={result.passed ? 'success' : 'danger'}
                                                className="h-1.5"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={result.passed ? 'success' : 'danger'}>
                                            {result.passed ? 'Pass' : 'Fail'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-dark-500">{result.teacher}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </DashboardLayout>
    )
}
