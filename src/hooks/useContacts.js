import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setContacts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const addContact = async ({ name, company, email }) => {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, company, email }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    setContacts(prev => [data, ...prev])
    return data
  }

  const deleteContact = async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return { contacts, loading, error, addContact, deleteContact, refetch: fetchContacts }
}
