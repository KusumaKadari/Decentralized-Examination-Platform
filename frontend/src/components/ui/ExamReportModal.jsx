import { useState, useEffect } from 'react'
import Modal from './Modal'
import { resultsAPI } from '../../api/api'
import { PageLoader } from './LoadingSpinner'
import Badge from './Badge'

export default function ExamReportModal({ isOpen, onClose, studentUsername, testId, testName, viewerRole = 'Student' }) {
    const [script, setScript] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen && studentUsername && testId) {
            loadScript()
        }
    }, [isOpen, studentUsername, testId])

    const loadScript = async () => {
        setLoading(true)
        setError(null)
        try {
            // resultsAPI.getScript needs to return the question details, user answer, and correct answer
            // Ideally the backend should support this. 
            // If the current backend only returns raw data, we might need to fetch questions separately,
            // but let's assume the endpoint provided in api.js `getScript` returns a composed object.
            const response = await resultsAPI.getScript(studentUsername, testId)
            // The backend returns a script object with an 'answers' array
            setScript(response.data.script?.answers || [])
        } catch (err) {
            console.error('Failed to load script:', err)
            setError('Failed to load exam details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Exam Report: ${testName || testId}`}
            size="xl"
        >
            {loading ? (
                <div className="py-12">
                    <PageLoader />
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger-500">
                    <p>{error}</p>
                    <button
                        onClick={loadScript}
                        className="mt-4 text-primary-600 hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            ) : script.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No detailed report available.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Student</p>
                            <p className="font-semibold text-gray-900">{studentUsername}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="font-semibold text-xl text-primary-600">
                                {script.filter(s => s.is_correct).length} / {script.length}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {script.map((item, index) => (
                            <div key={index} className={`border-2 rounded-xl p-4 transition-all ${item.is_correct ? 'border-success-100 bg-success-50/10' : 'border-danger-100 bg-danger-50/10'
                                }`}>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${item.is_correct ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                                            }`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-medium text-gray-900 mb-3 text-lg">{item.question}</h4>

                                        <div className="grid grid-cols-1 gap-2 mb-4">
                                            {['a', 'b', 'c', 'd'].map(opt => {
                                                const isSelected = item.user_answer?.toLowerCase() === opt
                                                const isCorrect = item.correct_answer?.toLowerCase() === opt

                                                let cardClass = "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                                if (isCorrect) {
                                                    cardClass = "bg-success-50 border-success-500 text-success-900 ring-1 ring-success-500"
                                                } else if (isSelected && !isCorrect) {
                                                    cardClass = "bg-danger-50 border-danger-500 text-danger-900 ring-1 ring-danger-500"
                                                }

                                                return (
                                                    <div
                                                        key={opt}
                                                        className={`p-3 rounded-lg border flex justify-between items-center transition-all ${cardClass}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="uppercase font-bold w-6">{opt}</span>
                                                            <span className="font-medium">{item[`option_${opt}`]}</span>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            {isCorrect && (
                                                                // Show Correct Answer badge only for Student, or differently for Teacher if desired
                                                                // User said: "in the student dashboard... mark... below mention correct ans"
                                                                // "teacher... just mark with green and red but dont show the correct"
                                                                // Implies Teacher shouldn't see the text 'Correct Answer'? Or just not the bottom explanation.
                                                                // Let's hide the badge for Teacher to be safe as per "dont show the correct", 
                                                                // but the styling (green border) remains.
                                                                viewerRole === 'Student' && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-800 border border-success-200">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                                        Correct Answer
                                                                    </span>
                                                                )
                                                            )}
                                                            {isSelected && !isCorrect && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-100 text-danger-800 border border-danger-200">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                    {viewerRole === 'Student' ? 'Your Wrong Answer' : 'Student Answer (Wrong)'}
                                                                </span>
                                                            )}
                                                            {isSelected && isCorrect && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-800 border border-success-200">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                                    {viewerRole === 'Student' ? 'Your Answer' : 'Student Answer'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {!item.is_correct && viewerRole === 'Student' && (
                                            <div className="bg-danger-50 border border-danger-100 rounded-lg p-3 text-sm text-danger-800 flex items-start gap-2">
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <div>
                                                    <span className="font-bold">Result:</span> You answered <span className="uppercase font-bold">{item.user_answer}</span> but the correct answer is <span className="uppercase font-bold">{item.correct_answer}</span>.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    )
}
