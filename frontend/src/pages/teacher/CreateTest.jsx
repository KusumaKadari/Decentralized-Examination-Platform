import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { questionsAPI, testsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function CreateTest() {
    const [questions, setQuestions] = useState([])
    const [selectedQuestions, setSelectedQuestions] = useState([]) // Array of indices as strings/ints
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [testNumber, setTestNumber] = useState('')
    const [message, setMessage] = useState(null)

    const { user } = useAuth()

    useEffect(() => {
        loadQuestions()
    }, [])

    const [numToSelect, setNumToSelect] = useState('')

    const loadQuestions = async () => {
        try {
            const response = await questionsAPI.list()
            setQuestions(response.data.questions || [])
        } catch (err) {
            console.error('Failed to load questions:', err)
            setMessage({ type: 'danger', text: 'Failed to load questions.' })
        } finally {
            setLoading(false)
        }
    }

    const handleCheckboxChange = (index) => {
        if (selectedQuestions.includes(index)) {
            setSelectedQuestions(selectedQuestions.filter(i => i !== index))
        } else {
            setSelectedQuestions([...selectedQuestions, index])
        }
    }

    const handleShuffleSelect = () => {
        const count = parseInt(numToSelect)
        if (isNaN(count) || count <= 0) {
            setMessage({ type: 'warning', text: 'Please enter a valid number of questions to select.' })
            return
        }
        if (count > questions.length) {
            setMessage({ type: 'warning', text: `Only ${questions.length} questions available.` })
            return
        }

        // Shuffle and select
        const indices = questions.map((_, i) => i)
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        setSelectedQuestions(indices.slice(0, count))
        setMessage({ type: 'success', text: `Randomly selected ${count} questions.` })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (selectedQuestions.length === 0) {
            setMessage({ type: 'warning', text: 'Please select at least one question.' })
            return
        }

        setSubmitting(true)
        setMessage(null)

        // Backend expects 'selected_questions' as a list of IPFS hashes
        const selectedHashes = selectedQuestions.map(index => questions[index].hash)

        try {
            const response = await testsAPI.create({
                test_number: testNumber,
                selected_questions: selectedHashes,
                teacher: user?.username, // API expects 'teacher' not 'teacher_name' based on serializer/view
                duration: 30, // Default or add input for it
                pass_percentage: 40 // Default or add input
            })

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message })
                setTestNumber('')
                setSelectedQuestions([])
            } else {
                setMessage({ type: 'danger', text: response.data.error })
            }
        } catch (err) {
            console.error(err)
            const errorData = err.response?.data
            let errorMsg = 'Failed to create test.'

            if (errorData) {
                if (errorData.error) {
                    errorMsg = errorData.error
                } else if (typeof errorData === 'object') {
                    // Handle field-specific validation errors from serializer
                    errorMsg = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                }
            }

            setMessage({
                type: 'danger',
                text: errorMsg
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Create Test">
                <PageLoader />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Create Test">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Col: Form */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <h2 className="text-xl font-semibold text-dark-800 mb-4">Test Details</h2>

                        {message && (
                            <Alert
                                variant={message.type}
                                className="mb-4"
                                onClose={() => setMessage(null)}
                            >
                                {message.text}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Test Number/Name"
                                value={testNumber}
                                onChange={(e) => setTestNumber(e.target.value)}
                                placeholder="e.g. CS101-Midterm"
                                required
                            />

                            <div className="bg-dark-50 p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-dark-600">Selected Questions</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {selectedQuestions.length}
                                    </p>
                                </div>
                                <hr className="border-dark-200" />
                                <div>
                                    <label className="block text-xs font-medium text-dark-500 mb-1">
                                        Random Selection
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={numToSelect}
                                            onChange={(e) => setNumToSelect(e.target.value)}
                                            placeholder="Count"
                                            className="w-20 px-2 py-1 text-sm border border-dark-300 rounded focus:border-primary-500 focus:outline-none"
                                            min="1"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleShuffleSelect}
                                            className="flex-1"
                                        >
                                            Shuffle & Select
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={submitting}
                                variant="success"
                                className="w-full"
                                disabled={selectedQuestions.length === 0}
                            >
                                Create Test
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Col: Questions Selection */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-semibold text-dark-800 mb-4">Select Questions</h2>
                        {questions.length === 0 ? (
                            <p className="text-dark-500">No questions available. Please add questions first.</p>
                        ) : (
                            <div className="space-y-4">
                                {questions.map((q, arrayIndex) => (
                                    <div
                                        key={arrayIndex}
                                        className={`
                      p-4 rounded-lg border transition-all cursor-pointer
                      ${selectedQuestions.includes(arrayIndex)
                                                ? 'border-success-500 bg-success-50 ring-1 ring-success-500'
                                                : 'border-dark-200 hover:border-success-300'
                                            }
                    `}
                                        onClick={() => handleCheckboxChange(arrayIndex)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestions.includes(arrayIndex)}
                                                    onChange={() => { }} // Handled by parent div click
                                                    className="w-4 h-4 text-success-600 rounded focus:ring-success-500"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-dark-800">{q.question}</p>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-dark-500">
                                                    <span>A: {q.option_a}</span>
                                                    <span>B: {q.option_b}</span>
                                                    <span>C: {q.option_c}</span>
                                                    <span>D: {q.option_d}</span>
                                                </div>
                                                <p className="text-xs text-success-600 mt-2 font-medium">
                                                    Answer: {q.correct_answer.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
