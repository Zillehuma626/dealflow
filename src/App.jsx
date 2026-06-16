import React, { useState } from 'react'
import { useContacts } from './hooks/useContacts'
import { useDeals } from './hooks/useDeals'
import { useGemini } from './hooks/useGemini'
import ContactsPanel from './components/ContactsPanel'
import PipelineBoard from './components/PipelineBoard'
import AddDealModal from './components/AddDealModal'

export default function App() {
  const contactsApi = useContacts()
  const dealsApi = useDeals()
  const { suggestions, loadingIds, suggestNextAction, clearSuggestion } = useGemini()
  const [showDealModal, setShowDealModal] = useState(false)

  // Moving a deal clears its old AI suggestion, since that advice was
  // generated for the previous stage and is no longer relevant.
  const handleMoveStage = async (id, stage) => {
    await dealsApi.updateDealStage(id, stage)
    clearSuggestion(id)
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-teal-600 rounded-md flex items-center justify-center text-sm font-bold flex-shrink-0">D</div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white leading-none">DealFlow</h1>
            <p className="text-xs text-gray-500 mt-0.5 truncate">Minimal CRM pipeline</p>
          </div>
        </div>
        <button
          onClick={() => setShowDealModal(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium flex-shrink-0"
        >
          + Add Deal
        </button>
      </header>

      {/* Main layout: contacts stack on top on mobile, sidebar on desktop */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <aside className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 p-4 max-h-[45vh] md:max-h-none overflow-hidden flex flex-col">
          <ContactsPanel
            contacts={contactsApi.contacts}
            loading={contactsApi.loading}
            error={contactsApi.error}
            onAdd={contactsApi.addContact}
            onDelete={contactsApi.deleteContact}
          />
        </aside>

        <main className="flex-1 min-h-0 p-3 md:p-4 overflow-hidden">
          <PipelineBoard
            deals={dealsApi.deals}
            loading={dealsApi.loading}
            error={dealsApi.error}
            onMoveStage={handleMoveStage}
            onDeleteDeal={dealsApi.deleteDeal}
            suggestions={suggestions}
            loadingIds={loadingIds}
            onSuggest={suggestNextAction}
          />
        </main>
      </div>

      {showDealModal && (
        <AddDealModal
          contacts={contactsApi.contacts}
          onClose={() => setShowDealModal(false)}
          onAdd={dealsApi.addDeal}
        />
      )}
    </div>
  )
}