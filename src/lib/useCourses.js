import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Fallback list if DB fetch fails or table is empty
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
    supabase
      .from('courses')
      .select('name')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setCourses(data.map(c => c.name))
        }
        setLoading(false)
      })
  }, [])

  return { COURSES, loading }
}
