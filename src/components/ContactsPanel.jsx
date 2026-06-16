import React, { useState } from 'react'
import Modal from './Modal'

export default function ContactsPanel({ contacts, loading, error, onAdd, onDelete }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await onAdd(form)
      setForm({ name: '', company: '', email: '' })
      setShowModal(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-200">
          Contacts <span className="text-gray-500 font-normal text-sm ml-1">{contacts.length}</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          + Add Contact
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading contacts...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3 text-sm">
          ⚠️ Failed to load contacts: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && contacts.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          <div className="text-3xl mb-2">👤</div>
          No contacts yet. Add your first one.
        </div>
      )}

      {/* Contact list */}
      <div className="space-y-2 overflow-y-auto flex-1 scrollbar-hide">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 flex items-start justify-between group hover:border-gray-600 transition-colors"
          >
            <div className="min-w-0">
              <div className="font-medium text-gray-100 text-sm truncate">{contact.name}</div>
              {contact.company && (
                <div className="text-xs text-gray-400 truncate">{contact.company}</div>
              )}
              <div className="text-xs text-gray-500 truncate mt-0.5">{contact.email}</div>
            </div>
            <button
              onClick={() => onDelete(contact.id)}
              className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0 text-sm"
              title="Delete contact"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Contact" onClose={() => { setShowModal(false); setFormError(null) }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                placeholder="Jane Smith"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                placeholder="jane@acme.com"
              />
            </div>

            {formError && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                {formError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowModal(false); setFormError(null) }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors font-medium"
              >
                {submitting ? 'Saving...' : 'Add Contact'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}