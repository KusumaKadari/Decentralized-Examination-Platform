import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { questionsAPI } from '../../api/api'

export default function ViewQuestions() {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadQuestions()
    }, [])

    const loadQuestions = async () => {
        try {
            const response = await questionsAPI.list()
            setQuestions(response.data.questions || [])
        } catch (err) {
            console.error('Failed to load questions:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="View Questions">
                <PageLoader />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="View Questions">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-dark-800">
                            All Questions
                        </h2>
                        <p className="text-dark-500 text-sm mt-1">
                            {questions.length} questions stored in IPFS
                        </p>
                    </div>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-dark-700">No Questions</h3>
                        <p className="text-dark-500 mt-1">
                            No questions have been added yet
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Question</TableHead>
                                <TableHead>Option A</TableHead>
                                <TableHead>Option B</TableHead>
                                <TableHead>Option C</TableHead>
                                <TableHead>Option D</TableHead>
                                <TableHead>Answer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.map((q, index) => (
                                <TableRow key={index}>
                                    <TableCell className="max-w-xs truncate font-medium">
                                        {q.question}
                                    </TableCell>
                                    <TableCell>{q.option_a}</TableCell>
                                    <TableCell>{q.option_b}</TableCell>
                                    <TableCell>{q.option_c}</TableCell>
                                    <TableCell>{q.option_d}</TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-success-600">
                                            {q.correct_answer}
                                        </span>
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
