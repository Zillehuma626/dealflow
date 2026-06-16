import React from 'react'
import { STAGES } from '../hooks/useDeals'

export default function DealCard({ deal, onMoveStage, onDelete, suggestion, isLoadingSuggestion, onSuggest }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 group hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-medium text-gray-100 text-sm truncate">{deal.title}</h4>
          <div className="text-xs text-emerald-400 font-semibold mt-0.5">
            ${Number(deal.value).toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => onDelete(deal.id)}
          className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 text-sm"
          title="Delete deal"
        >
          ✕
        </button>
      </div>

      {deal.contacts && (
        <div className="text-xs text-gray-400 mt-1.5 truncate">
          {deal.contacts.name}
          {deal.contacts.company && <span className="text-gray-600"> · {deal.contacts.company}</span>}
        </div>
      )}

      {/* Stage dropdown — moving updates Supabase */}
      <select
        value={deal.stage}
        onChange={(e) => onMoveStage(deal.id, e.target.value)}
        className="w-full mt-2.5 bg-gray-900 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {STAGES.map(stage => (
          <option key={stage} value={stage}>{stage}</option>
        ))}
      </select>

      {/* Gemini AI suggestion */}
      <button
        onClick={() => onSuggest(deal)}
        disabled={isLoadingSuggestion}
        className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-700/50 text-indigo-300 px-2 py-1.5 rounded-md transition-colors disabled:opacity-60"
      >
        {isLoadingSuggestion ? (
          <>
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Thinking...
          </>
        ) : (
          <>✨ Suggest next action</>
        )}
      </button>

      {/* Streamed suggestion text */}
      {suggestion !== undefined && suggestion !== '' && (
        <div className="mt-2 text-xs text-gray-300 bg-gray-900/60 border border-gray-700/50 rounded-md px-2.5 py-2 leading-relaxed">
          {suggestion}
          {isLoadingSuggestion && <span className="inline-block w-1 h-3 bg-indigo-400 ml-0.5 animate-pulse align-middle" />}
        </div>
      )}
    </div>
  )
}
