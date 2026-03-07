import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

const handle = (promise) => promise.then((response) => response.data)

export const getUsers = () => handle(api.get('/users'))
export const registerUser = (payload) => handle(api.post('/auth/register', payload))
export const loginUser = (payload) => handle(api.post('/auth/login', payload))

export const getMarketplaceSkills = () => handle(api.get('/skills/marketplace'))
export const getSkillsByOwner = (ownerId) => handle(api.get(`/skills/owner/${ownerId}`))
export const createSkill = (ownerId, payload) => handle(api.post(`/skills/owner/${ownerId}`, payload))
export const getRecommendations = (userId) => handle(api.get(`/skills/recommendations/${userId}`))

export const createSwapRequest = (payload) => handle(api.post('/requests', payload))
export const getInboxRequests = (userId) => handle(api.get(`/requests/inbox/${userId}`))
export const getOutboxRequests = (userId) => handle(api.get(`/requests/outbox/${userId}`))
export const updateSwapRequest = (requestId, payload) => handle(api.patch(`/requests/${requestId}`, payload))

export const getDashboard = (userId) => handle(api.get(`/dashboard/${userId}`))

export const toApiError = (error) => {
  const fallback = 'Request failed. Please try again.'

  if (!error?.response?.data) {
    return fallback
  }

  const { message, validationErrors } = error.response.data
  if (validationErrors && typeof validationErrors === 'object') {
    const joined = Object.entries(validationErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(' | ')
    return joined || message || fallback
  }

  return message || fallback
}
