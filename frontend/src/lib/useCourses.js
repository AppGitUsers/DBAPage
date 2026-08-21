import { useState, useEffect } from 'react'
import { apiGet } from './apiClient'

// Fallback list if API fetch fails or the course list is empty
export const FALLBACK_COURSES = [
  'Oracle Developer',
  'Oracle DBA',
  'PostgreSQL Developer',
  'PostgreSQL DBA',
  'Linux',
  'Environment',
]

export function useCourses() {
  const [COURSES, setCourses] = useState(FALLBACK_COURSES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/courses/')
      .then((data) => {
        if (data && data.length > 0) {
          setCourses(data.map((c) => c.name))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { COURSES, loading }
}
