import React from 'react'
import { STAGES } from '../hooks/useDeals'
import DealCard from './DealCard'

const STAGE_COLORS = {
  Lead: 'border-t-gray-500',
  Qualified: 'border-t-blue-500',
  Proposal: 'border-t-amber-500',
  Won: 'border-t-emerald-500',
  Lost: 'border-t-red-500',
}

export default function PipelineBoard({
  deals,
  loading,
  error,
  onMoveStage,
  onDeleteDeal,
  suggestions,
  loadingIds,
  onSuggest,
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-20 justify-center">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading pipeline...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-4 text-sm m-4">
        ⚠️ Failed to load deals: {error}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-4 h-full snap-x snap-mandatory sm:snap-none scrollbar-hide">
      {STAGES.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage)
        const stageTotal = stageDeals.reduce((sum, d) => sum + Number(d.value), 0)

        return (
          <div
            key={stage}
            className={`flex-shrink-0 w-[85vw] sm:w-72 snap-center sm:snap-align-none bg-gray-900/50 border border-gray-800 border-t-2 ${STAGE_COLORS[stage]} rounded-lg flex flex-col max-h-full`}
          >
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-200">{stage}</span>
                <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {stageDeals.length}
                </span>
              </div>
              {stageTotal > 0 && (
                <span className="text-xs text-gray-500">${stageTotal.toLocaleString()}</span>
              )}
            </div>

            <div className="p-2.5 space-y-2 overflow-y-auto flex-1 scrollbar-hide">
              {stageDeals.length === 0 ? (
                <div className="text-center text-gray-600 text-xs py-6">No deals</div>
              ) : (
                stageDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onMoveStage={onMoveStage}
                    onDelete={onDeleteDeal}
                    suggestion={suggestions[deal.id]}
                    isLoadingSuggestion={loadingIds.has(deal.id)}
                    onSuggest={onSuggest}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}