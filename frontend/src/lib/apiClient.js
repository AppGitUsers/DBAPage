const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'dbapage_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(method, path, body, tokenOverride) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenOverride !== undefined ? tokenOverride : getToken()
  if (token) headers.Authorization = `Token ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.error)) ||
      (typeof data === 'object' && data ? Object.values(data).flat().join(' ') : null) ||
      res.statusText
    throw new ApiError(message, res.status, data)
  }
  return data
}

// `token`, when passed, overrides the shared student session token for this
// call — used by the admin panel, which keeps its own separate session.
export const apiGet = (path, token) => request('GET', path, undefined, token)
export const apiPost = (path, body, token) => request('POST', path, body, token)
export const apiPatch = (path, body, token) => request('PATCH', path, body, token)
export const apiPut = (path, body, token) => request('PUT', path, body, token)
export const apiDelete = (path, token) => request('DELETE', path, undefined, token)
