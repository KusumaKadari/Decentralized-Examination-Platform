import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Auth API
export const authAPI = {
    login: (username, password, userType) =>
        api.post('/auth/login/', { username, password, user_type: userType }),
    logout: () => api.post('/auth/logout/'),
}

// Users API
export const usersAPI = {
    list: () => api.get('/users/'),
    create: (userData) => api.post('/users/', userData),
}

// Questions API
export const questionsAPI = {
    list: () => api.get('/questions/'),
    create: (questionData) => api.post('/questions/', questionData),
}

// Tests API
export const testsAPI = {
    list: (params = {}) => api.get('/tests/', { params }),
    create: (testData) => api.post('/tests/', testData),
    get: (testIndex) => api.get(`/tests/${testIndex}/`),
    update: (testIndex, testData) => api.put(`/tests/${testIndex}/`, testData),
    delete: (testIndex, teacher) =>
        api.delete(`/tests/${testIndex}/`, { params: { teacher } }),
}

// Exams API
export const examsAPI = {
    selectTest: (testIndex, student) =>
        api.get(`/exams/select/${testIndex}/`, { params: { student } }),
    submit: (examData) => api.post('/exams/submit/', examData),
}

// Results API
export const resultsAPI = {
    list: (params = {}) => api.get('/results/', { params }),
    getScript: (student, test) =>
        api.get('/results/script/', { params: { student, test } }),
}

export default api
