import React, { useState } from 'react'
import Modal from './Modal'
import { STAGES } from '../hooks/useDeals'

export default function AddDealModal({ contacts, onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '',
    value: '',
    stage: 'Lead',
    contact_id: contacts[0]?.id || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Deal title is required.')
      return
    }
    if (!form.contact_id) {
      setError('Please add a contact first, then link the deal to it.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onAdd(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add Deal" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            placeholder="Website redesign project"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Value ($)</label>
          <input
            type="number"
            min="0"
            value={form.value}
            onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            placeholder="5000"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Contact *</label>
          <select
            value={form.contact_id}
            onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
          >
            {contacts.length === 0 && <option value="">No contacts — add one first</option>}
            {contacts.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Stage</label>
          <select
            value={form.stage}
            onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors font-medium"
          >
            {submitting ? 'Saving...' : 'Add Deal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}