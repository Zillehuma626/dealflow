import { useState } from 'react'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export function useGemini() {
  const [suggestions, setSuggestions] = useState({}) // keyed by deal id
  const [loadingIds, setLoadingIds] = useState(new Set())

  const suggestNextAction = async (deal) => {
    if (!GEMINI_API_KEY) {
      setSuggestions(prev => ({
        ...prev,
        [deal.id]: '⚠️ Gemini API key not set. Add VITE_GEMINI_API_KEY to your .env file.',
      }))
      return
    }

    setLoadingIds(prev => new Set([...prev, deal.id]))
    setSuggestions(prev => ({ ...prev, [deal.id]: '' }))

    const prompt = `You are an experienced CRM sales assistant advising a salesperson on a single deal.

Deal details:
- Title: ${deal.title}
- Value: $${deal.value}
- Current stage: ${deal.stage}
- Contact: ${deal.contacts?.name || 'Unknown'} at ${deal.contacts?.company || 'Unknown company'}

Suggest ONE specific next action. Critically, the action MUST be proportionate to the deal's value — match the effort to what the deal is worth:
- Very low or $0 value: suggest a lightweight, low-effort action (a quick email, a clarifying question to confirm scope/budget, or deprioritizing it). Do NOT suggest time-expensive actions like scheduling meetings or calls for a deal that isn't worth that time.
- Mid value: a proportionate follow-up appropriate to the ${deal.stage} stage.
- High value: a high-touch action (a call or meeting) is justified.

Also make the action fit the "${deal.stage}" stage. Reply with ONE concise sentence only, no preamble.`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 150, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 },},
            
          }),
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'Gemini API error')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace('data: ', ''))
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
            fullText += text
            setSuggestions(prev => ({ ...prev, [deal.id]: fullText }))
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      setSuggestions(prev => ({
        ...prev,
        [deal.id]: `Error: ${err.message}`,
      }))
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev)
        next.delete(deal.id)
        return next
      })
    }
  }

  const clearSuggestion = (dealId) => {
    setSuggestions(prev => {
      const next = { ...prev }
      delete next[dealId]
      return next
    })
  }

  return { suggestions, loadingIds, suggestNextAction, clearSuggestion }
}
