import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import Alert from '../../components/ui/Alert'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { examsAPI } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function WriteExam() {
    const { state } = useLocation()
    const navigation = useNavigate() // Renamed to avoid confusion with navigate function
    const { user } = useAuth()

    const [testData, setTestData] = useState(state?.testData || null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({}) // {hash: selectedOption}
    const [timeLeft, setTimeLeft] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Timer ref to clear interval
    const timerRef = useRef(null)

    useEffect(() => {
        // If no test data (e.g. refresh), redirect to select test
        if (!testData) {
            navigation('/student/select-test')
            return
        }

        // Initialize timer (duration in minutes * 60)
        // If stored start time exists, calculate remaining? 
        // For MVP, just start fresh timer or assume session persistence is checking cheating.
        // Ideally, backend should track start time.
        setTimeLeft(testData.test.duration * 60)

        // Prevent accidental tab close
        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [testData, navigation])

    useEffect(() => {
        if (timeLeft > 0 && !submitting) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current)
                        handleSubmit(true) // Auto submit
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(timerRef.current)
    }, [timeLeft, submitting])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleOptionSelect = (optionKey) => {
        const currentQuestion = testData.questions[currentQuestionIndex]
        setAnswers({
            ...answers,
            [currentQuestion.hash]: optionKey
        })
    }

    const handleNext = () => {
        if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleSubmit = async (auto = false) => {
        if (!auto && !window.confirm('Are you sure you want to submit your exam?')) {
            return
        }

        setSubmitting(true)
        if (timerRef.current) clearInterval(timerRef.current)

        try {
            const payload = {
                student: user.username,
                test_number: testData.test.test_number,
                teacher_name: testData.test.teacher,
                answers: answers
            }

            const response = await examsAPI.submit(payload)

            if (response.data.success) {
                // Navigate to results or dashboard with success message
                // Maybe show a quick result modal?
                // Let's just go to marks page.
                alert(`Exam Submitted! Score: ${response.data.result.score}%`)
                navigation('/student/marks')
            } else {
                setError(response.data.error || 'Submission failed')
                setSubmitting(false)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to submit exam. Please try again or contact admin.')
            setSubmitting(false)
        }
    }

    if (!testData) return <PageLoader />

    const currentQuestion = testData.questions[currentQuestionIndex]
    const answeredCount = Object.keys(answers).length
    const totalQuestions = testData.questions.length
    const progress = (answeredCount / totalQuestions) * 100
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Exam Header */}
            <header className="bg-white border-b border-dark-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-dark-800 text-lg sm:text-xl">
                            {testData.test.test_number}
                        </h1>
                        <p className="text-xs text-dark-500">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`
              text-xl font-mono font-bold px-4 py-2 rounded-lg
              ${timeLeft < 60 ? 'bg-danger-100 text-danger-600 animate-pulse' : 'bg-dark-100 text-dark-800'}
            `}>
                            {formatTime(timeLeft)}
                        </div>
                        <Button
                            variant="danger"
                            onClick={() => handleSubmit(false)}
                            loading={submitting}
                            className="hidden sm:inline-flex"
                        >
                            Finish Exam
                        </Button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-dark-100 w-full">
                    <div
                        className="h-full bg-success-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

                <Card className="min-h-[400px] flex flex-col">
                    <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-medium text-dark-900 mb-8 leading-relaxed">
                            {currentQuestionIndex + 1}. {currentQuestion.question}
                        </h2>

                        <div className="space-y-3">
                            {['a', 'b', 'c', 'd'].map((optionKey) => {
                                const optionText = currentQuestion[`option_${optionKey}`]
                                const isSelected = answers[currentQuestion.hash] === optionKey

                                return (
                                    <div
                                        key={optionKey}
                                        onClick={() => handleOptionSelect(optionKey)}
                                        className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      flex items-center gap-4 group hover:shadow-sm
                      ${isSelected
                                                ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                                : 'border-dark-100 hover:border-primary-300 hover:bg-white'
                                            }
                    `}
                                    >
                                        <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs
                      ${isSelected
                                                ? 'border-primary-500 bg-primary-500 text-white'
                                                : 'border-dark-300 text-dark-400 group-hover:border-primary-400'
                                            }
                    `}>
                                            {optionKey.toUpperCase()}
                                        </div>
                                        <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-dark-700'}`}>
                                            {optionText}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-dark-100">
                        <Button
                            variant="secondary"
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                variant="success"
                                onClick={() => handleSubmit(false)}
                                loading={submitting}
                                className="w-32"
                            >
                                Submit
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                className="w-32"
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Question Navigator (Mobile friendly grid) */}
                <div className="mt-8">
                    <p className="text-sm font-medium text-dark-500 mb-2">Question Navigator</p>
                    <div className="flex flex-wrap gap-2">
                        {testData.questions.map((q, idx) => {
                            const isAnswered = !!answers[q.hash]
                            const isCurrent = idx === currentQuestionIndex
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-all
                    ${isCurrent
                                            ? 'bg-dark-800 text-white ring-2 ring-offset-2 ring-dark-800'
                                            : isAnswered
                                                ? 'bg-success-100 text-success-700 border border-success-300'
                                                : 'bg-white text-dark-500 border border-dark-200 hover:border-dark-300'
                                        }
                  `}
                                >
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
