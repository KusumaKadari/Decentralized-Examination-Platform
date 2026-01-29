import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardTitle, CardDescription } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { questionsAPI } from '../../api/api'

export default function AddQuestion() {
    const [formData, setFormData] = useState({
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const { user } = useAuth()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            // Include teacher username in request
            const dataToSend = {
                ...formData,
                teacher: user?.username || 'Unknown'
            }

            const response = await questionsAPI.create(dataToSend)
            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message })

                // Auto-dismiss success message
                setTimeout(() => {
                    setMessage(null)
                }, 3000)

                setFormData({
                    question: '',
                    option_a: '',
                    option_b: '',
                    option_c: '',
                    option_d: '',
                    correct_answer: '',
                })
            } else {
                setMessage({ type: 'danger', text: response.data.error })
            }
        } catch (err) {
            setMessage({
                type: 'danger',
                text: err.response?.data?.error || 'Failed to add question. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Add Question">
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardTitle>Add New Question</CardTitle>
                    <CardDescription>
                        Add a multiple-choice question to the global question bank
                    </CardDescription>

                    {message && (
                        <Alert
                            variant={message.type}
                            className="mt-4"
                            onClose={() => setMessage(null)}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                Question Text <span className="text-danger-500">*</span>
                            </label>
                            <textarea
                                name="question"
                                value={formData.question}
                                onChange={handleChange}
                                className="input min-h-[100px]"
                                placeholder="Enter the question text..."
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Option A"
                                name="option_a"
                                value={formData.option_a}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Option B"
                                name="option_b"
                                value={formData.option_b}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Option C"
                                name="option_c"
                                value={formData.option_c}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Option D"
                                name="option_d"
                                value={formData.option_d}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                Correct Answer <span className="text-danger-500">*</span>
                            </label>
                            <select
                                name="correct_answer"
                                value={formData.correct_answer}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                <option value="">Select correct option</option>
                                <option value="a">Option A</option>
                                <option value="b">Option B</option>
                                <option value="c">Option C</option>
                                <option value="d">Option D</option>
                            </select>
                        </div>

                        <Button type="submit" loading={loading} variant="success" className="w-full">
                            Add Question
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    )
}
