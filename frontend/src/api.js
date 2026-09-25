const TOKEN_KEY = 'medvault_session'

export function getSession() {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setSession(session) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const session = getSession()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`
  }

  const response = await fetch(path, { ...options, headers })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.error || data?.message || Object.values(data || {})[0] || 'Request failed'
    throw new Error(message)
  }
  return data
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  createStaff: (body) => request('/api/auth/create-staff', { method: 'POST', body: JSON.stringify(body) }),
  doctors: () => request('/api/doctors'),
  createDoctor: (body) => request('/api/doctors', { method: 'POST', body: JSON.stringify(body) }),
  patients: () => request('/api/patients'),
  history: (patientId) => request(`/api/patients/${patientId}/history`),
  addNote: (body) => request('/api/patients/notes', { method: 'POST', body: JSON.stringify(body) }),
  slots: () => request('/api/slots'),
  availableSlots: (doctorId) => request(`/api/slots/available?doctorId=${doctorId}`),
  createSlot: (body) => request('/api/slots', { method: 'POST', body: JSON.stringify(body) }),
  appointments: () => request('/api/appointments'),
  book: (body) => request('/api/appointments/book', { method: 'POST', body: JSON.stringify(body) }),
  cancel: (id) => request(`/api/appointments/${id}/cancel`, { method: 'POST' }),
}
