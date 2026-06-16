import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost']

export function useDeals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('deals')
      .select('*, contacts(id, name, company, email)')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setDeals(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const addDeal = async ({ title, value, stage, contact_id }) => {
    const { data, error } = await supabase
      .from('deals')
      .insert([{ title, value: Number(value), stage, contact_id }])
      .select('*, contacts(id, name, company, email)')
      .single()

    if (error) throw new Error(error.message)
    setDeals(prev => [data, ...prev])
    return data
  }

  const updateDealStage = async (id, stage) => {
    const { error } = await supabase
      .from('deals')
      .update({ stage })
      .eq('id', id)

    if (error) throw new Error(error.message)
    setDeals(prev =>
      prev.map(d => (d.id === id ? { ...d, stage } : d))
    )
  }

  const deleteDeal = async (id) => {
    const { error } = await supabase.from('deals').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setDeals(prev => prev.filter(d => d.id !== id))
  }

  return { deals, loading, error, addDeal, updateDealStage, deleteDeal, refetch: fetchDeals }
}
