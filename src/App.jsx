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

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-sm font-bold">D</div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">DealFlow</h1>
            <p className="text-xs text-gray-500 mt-0.5">Minimal CRM pipeline</p>
          </div>
        </div>
        <button
          onClick={() => setShowDealModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          + Add Deal
        </button>
      </header>

      {/* Main layout: sidebar contacts + pipeline */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-gray-800 p-4 flex-shrink-0 overflow-hidden">
          <ContactsPanel
            contacts={contactsApi.contacts}
            loading={contactsApi.loading}
            error={contactsApi.error}
            onAdd={contactsApi.addContact}
            onDelete={contactsApi.deleteContact}
          />
        </aside>

        <main className="flex-1 p-4 overflow-hidden">
          <PipelineBoard
            deals={dealsApi.deals}
            loading={dealsApi.loading}
            error={dealsApi.error}
            onMoveStage={async (id, stage) => {
              await dealsApi.updateDealStage(id, stage)
              clearSuggestion(id)
            }}
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
