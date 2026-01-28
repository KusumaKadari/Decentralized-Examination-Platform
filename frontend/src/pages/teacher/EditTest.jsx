import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { questionsAPI, testsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function EditTest() {
    const { testIndex } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState(null)

    // Form State
    const [testNumber, setTestNumber] = useState('')
    const [duration, setDuration] = useState(30)
    const [passPercentage, setPassPercentage] = useState(40)
    const [selectedQuestions, setSelectedQuestions] = useState([]) // Set of hashes

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch all available questions (to show selection list)
                const qResponse = await questionsAPI.list()
                const allQuestions = qResponse.data.questions || []

                // 2. Fetch test details
                const tResponse = await testsAPI.get(testIndex)
                if (tResponse.data.success) {
                    const test = tResponse.data.test
                    setTestNumber(test.test_number)
                    setDuration(test.duration)
                    setPassPercentage(test.pass_percentage)

                    // The backend now returns 'selected' status in detailed question list too, 
                    // or we can map from 'question_hashes'. 
                    // Let's rely on 'question_hashes' from test object if available,
                    // or use the 'selected' flag from the response questions if the view provides it.
                    // Based on my view update, the get response provides 'questions' array with 'selected' flag.

                    const testQuestions = tResponse.data.questions || []

                    // We need to merge or use the testQuestions which has the 'selected' boolean
                    // Actually, let's just use the returned questions from the Test Detail API 
                    // because that list might be authoritative for indices?
                    // Wait, the 'questionsAPI.list' returns ALL questions from IPFS history.
                    // The 'testsAPI.get' returns detailed breakdown.
                    // Ideally we want to show ALL questions so the teacher can add UNSELECTED ones.
                    // My updated 'test_detail' view returns ALL questions with a 'selected' flag.
                    // So I can just use tResponse.data.questions!

                    setQuestions(tResponse.data.questions)

                    // Set initial selection set
                    const initialSelection = new Set(
                        tResponse.data.questions
                            .filter(q => q.selected)
                            .map(q => q.hash)
                    )
                    setSelectedQuestions(initialSelection)
                }
            } catch (err) {
                console.error(err)
                setMessage({ type: 'danger', text: 'Failed to load test details.' })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [testIndex])

    const toggleQuestion = (hash) => {
        const newSelection = new Set(selectedQuestions)
        if (newSelection.has(hash)) {
            newSelection.delete(hash)
        } else {
            newSelection.add(hash)
        }
        setSelectedQuestions(newSelection)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (selectedQuestions.size === 0) {
            setMessage({ type: 'warning', text: 'Please select at least one question.' })
            return
        }

        setSubmitting(true)
        setMessage(null)

        try {
            const response = await testsAPI.update(testIndex, {
                duration: parseInt(duration),
                pass_percentage: parseInt(passPercentage),
                selected_questions: Array.from(selectedQuestions),
                teacher: user?.username
            })

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Test updated successfully!' })
                setTimeout(() => navigate('/teacher/manage-tests'), 1500)
            } else {
                setMessage({ type: 'danger', text: response.data.error })
            }
        } catch (err) {
            setMessage({
                type: 'danger',
                text: err.response?.data?.error || 'Failed to update test.'
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <PageLoader />

    return (
        <DashboardLayout role="Teacher">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Test</h1>
                    <p className="text-gray-500">Modify test details and questions</p>
                </div>

                {message && (
                    <Alert variant={message.type} className="mb-6">
                        {message.text}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Test Details Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Test Number</label>
                                <input
                                    type="text"
                                    value={testNumber}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    min="1"
                                    max="180"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pass Percentage (%)</label>
                                <input
                                    type="number"
                                    value={passPercentage}
                                    onChange={(e) => setPassPercentage(e.target.value)}
                                    min="1"
                                    max="100"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Select Questions</h3>
                            <span className="text-sm text-gray-500">
                                {selectedQuestions.size} selected
                            </span>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {questions.map((q) => (
                                <div
                                    key={q.hash}
                                    onClick={() => toggleQuestion(q.hash)}
                                    className={`
                                        relative group p-4 rounded-xl border-2 transition-all cursor-pointer select-none
                                        ${selectedQuestions.has(q.hash)
                                            ? 'border-primary-500 bg-primary-50/30'
                                            : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5
                                            ${selectedQuestions.has(q.hash)
                                                ? 'bg-primary-500 border-primary-500 text-white'
                                                : 'border-gray-300 group-hover:border-primary-400'
                                            }
                                        `}>
                                            {selectedQuestions.has(q.hash) && (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-gray-900 font-medium">{q.question}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/teacher/manage-tests')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={submitting}
                            className="min-w-[120px]"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
