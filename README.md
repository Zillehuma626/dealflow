# DealFlow — Minimal CRM with Kanban Pipeline

A lightweight CRM for managing contacts and deals through a sales pipeline. Built with React + Tailwind, backed by Supabase, with a Gemini-powered "suggest next action" feature on each deal.

## Features

- **Contacts** — add and delete (name, company, email)
- **Deals** — linked to a contact, with title, value, and stage; add and delete
- **Pipeline view** — deals shown as cards grouped by stage; moving a deal (via dropdown on the card) updates its stage in Supabase instantly
- **AI suggestions** — each deal card has a "Suggest next action" button that sends the deal's context to Gemini and streams back a one-sentence recommendation inline
- **Loading & error states** — handled visibly throughout (contacts panel, pipeline board, and forms)

## Pipeline Stages

`Lead → Qualified → Proposal → Won / Lost`

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (Vite) |
| Styling | Tailwind CSS (no component libraries) |
| Database | Supabase (Postgres) |
| AI | Google Gemini (`gemini-2.5-flash`, streaming) |

## Project Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client setup
├── hooks/
│   ├── useContacts.js       # contacts CRUD + state
│   ├── useDeals.js          # deals CRUD + stage updates
│   └── useGemini.js         # streaming AI suggestions
├── components/
│   ├── ContactsPanel.jsx    # sidebar: list + add/delete contacts
│   ├── PipelineBoard.jsx    # kanban columns grouped by stage
│   ├── DealCard.jsx         # single deal card + AI button
│   ├── AddDealModal.jsx     # form to create a deal
│   └── Modal.jsx            # reusable modal shell
└── App.jsx                  # layout + wires hooks to components
```

The pattern: **data logic lives in hooks, UI lives in components.** Each hook owns one table's state and exposes simple functions (`addDeal`, `updateDealStage`, etc.) so components stay focused on rendering.

## Database Schema

Two tables with a foreign key from `deals` to `contacts`:

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL CHECK (stage IN ('Lead', 'Qualified', 'Proposal', 'Won', 'Lost')),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

`ON DELETE CASCADE` means deleting a contact also removes their deals, keeping the data consistent.

### Row Level Security

The brief specifies no auth. Rather than disabling RLS, it's left **enabled** with an explicit permissive policy on each table:

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on deals" ON deals FOR ALL USING (true) WITH CHECK (true);
```

This keeps the security model intentional and documented — if auth were added later, only the policies would need tightening.

## Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd dealflow
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the **SQL Editor**, run the schema and RLS policies above
3. From **Settings → API**, copy your Project URL and `anon` public key

### 3. Get a Gemini API key

Create a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run

```bash
npm run dev
```

Open the printed localhost URL.

## How the AI Feature Works

When you click **Suggest next action** on a deal card, `useGemini` builds a prompt from that deal's real context (title, value, stage, and the linked contact's name and company) and calls Gemini's streaming endpoint. The response is read chunk-by-chunk from the SSE stream and rendered into the card as it arrives, so you see the text appear word by word rather than waiting for the full reply.

## Notes

- **No component libraries** — all UI is hand-built with Tailwind utility classes.
- The pipeline uses a **dropdown** to move deals between stages (the brief allowed drag-and-drop or a dropdown). A dropdown is keyboard-accessible and simpler to reason about for this scope.
- State updates **optimistically** in the UI after each Supabase write, so the board reflects changes immediately without a full refetch.
