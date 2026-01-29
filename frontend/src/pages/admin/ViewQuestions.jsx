import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { questionsAPI } from '../../api/api'

export default function ViewQuestions() {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const [expandedTeacher, setExpandedTeacher] = useState(searchParams.get('teacher') || null)

    useEffect(() => {
        loadQuestions()
    }, [])

    const loadQuestions = async () => {
        try {
            const response = await questionsAPI.list()
            let allQuestions = response.data.questions || []
            setQuestions(allQuestions)
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
                            All Questions (Grouped by Teacher)
                        </h2>
                        <p className="text-dark-500 text-sm mt-1">
                            Total Questions: {questions.length}
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
                    <div className="space-y-4">
                        {/* Group questions by teacher */}
                        {Object.entries(
                            questions.reduce((acc, q) => {
                                const teacher = q.teacher || 'Unknown'
                                if (!acc[teacher]) acc[teacher] = []
                                acc[teacher].push(q)
                                return acc
                            }, {})
                        ).map(([teacher, teacherQuestions]) => (
                            <div key={teacher} className="border rounded-xl overflow-hidden shadow-sm bg-white">
                                <button
                                    onClick={() => setExpandedTeacher(expandedTeacher === teacher ? null : teacher)}
                                    className="w-full bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-sm">
                                            👨‍🏫
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-gray-900">{teacher}</h3>
                                            <p className="text-xs text-gray-500">Teacher ID</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            {teacherQuestions.length} Questions
                                        </span>
                                        <div className={`transform transition-transform duration-200 text-gray-400 ${expandedTeacher === teacher ? 'rotate-180' : ''}`}>
                                            ▼
                                        </div>
                                    </div>
                                </button>

                                {expandedTeacher === teacher && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question</TableHead>
                                                    <TableHead>Option A</TableHead>
                                                    <TableHead>Option B</TableHead>
                                                    <TableHead>Option C</TableHead>
                                                    <TableHead>Option D</TableHead>
                                                    <TableHead>Correct Answer</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {teacherQuestions.map((q, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="max-w-xs truncate font-medium">
                                                            {q.question}
                                                        </TableCell>
                                                        <TableCell>{q.option_a}</TableCell>
                                                        <TableCell>{q.option_b}</TableCell>
                                                        <TableCell>{q.option_c}</TableCell>
                                                        <TableCell>{q.option_d}</TableCell>
                                                        <TableCell>
                                                            <span className="font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded">
                                                                {q.correct_answer}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </DashboardLayout>
    )
}
