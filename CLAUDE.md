# YS Group — AI Admission Enquiry Automation

## Project
React (Vite + Tailwind v4) + n8n cloud + Supabase (pgvector RAG).
Job assignment for AI Automation Manager role at YS Group of Institutions.

## Stack
- **Frontend:** React 18, Vite, Tailwind CSS v4, react-router-dom, lucide-react, axios, @supabase/supabase-js
- **Automation:** n8n cloud — `sudeepkumar233.app.n8n.cloud`
- **Database:** Supabase — `nrbrmtvivpyqnsmfdhhr.supabase.co` (pgvector enabled)
- **Dev server:** `npm run dev` → `http://localhost:5173`

## Key Files
```
src/
  config.js           ← n8n webhook URLs + Supabase URL/anon key
  supabase.js         ← Supabase client (anon key, read-only from frontend)
  App.jsx             ← Router + layout
  pages/
    EnquiryForm.jsx   ← Parent form, validation, priority scoring
    ThankYou.jsx      ← Post-submit confirmation
    AdminDashboard.jsx← Leads from Supabase (live), stats, modal
    DailyReport.jsx   ← KPIs, charts, email trigger
  components/
    Navbar.jsx        ← Top nav
supabase_setup.sql    ← Run ONCE in Supabase SQL Editor to create tables
```

## Supabase
- **Project:** `nrbrmtvivpyqnsmfdhhr` (ap-south-1, Mumbai)
- **Tables:** `admission_leads`, `lead_embeddings` (vector(1536) for RAG)
- **RPC functions:** `match_leads()` (cosine similarity search), `get_daily_stats()`
- **RLS:** anon = SELECT only; service_role = full access (used by n8n)
- **Setup:** Run `supabase_setup.sql` in Supabase SQL Editor (one-time)

## n8n Workflows (all live)
| Workflow ID | Name | Webhook | Status |
|---|---|---|---|
| `VUaTSWR0jxozUbtg` | Enquiry + Supabase + RAG | `POST /webhook/admission-enquiry` | **ACTIVE** |
| `c5W1Tsllltk8hIlF` | Daily Admissions Report | `POST /webhook/daily-report` | **ACTIVE** |
| `V0MklADdaoYHKNEh` | Enquiry + Gmail + OpenAI | — | Draft (needs creds) |
| `MXefb0lV9Oe5IoxF` | Report + Gmail + OpenAI | — | Draft (needs creds) |
| `KC2TlT7JO9eh9uAR` | Old enquiry (no Supabase) | — | Unpublished |

## MCP Servers (in ~/.claude.json)
- `n8n-mcp` — HTTP MCP at `sudeepkumar233.app.n8n.cloud/mcp-server/http`
  - Tools: `create_workflow_from_code`, `publish_workflow`, `unpublish_workflow`, `search_workflows`
  - Requires header: `Accept: application/json, text/event-stream`
- `supabase` — npx `@supabase/mcp-server-supabase` (needs PAT from supabase.com/dashboard/account/tokens for full DDL; current token is service_role)

## Full Pipeline (current active flow)
```
React form submit
  → POST /webhook/admission-enquiry (n8n)
  → Code: Enrich (leadId, priority, assignedTo, embedContent)
  → HTTP POST: Save to Supabase admission_leads (service_role)
  → HTTP GET: RAG — fetch 3 similar leads by class (cosine similarity ready)
  → Code: Generate personalized HTML email with RAG context
  → Respond 200: { success, leadId, priority, similarLeadsFound, ragEnabled }

Admin Dashboard:
  → Supabase SELECT admission_leads (anon key, RLS read policy)

Daily at 6 PM:
  → POST /webhook/daily-report → generate HTML report → Respond 200
  → (with Gmail cred) email report to management
```

## Priority / Assignment Logic
- **High** → Class 9–12 OR "urgent" in message
- **Medium** → source = Friend/Family Referral
- **Normal** → everything else
- Assignee: Class 9–12 → Vikram Singh; else → Sunita Sharma

## Credentials Needed (add in n8n cloud settings)
1. **Gmail OAuth2** — acknowledgement + daily report emails
2. **OpenAI API Key** — embeddings (text-embedding-3-small) for full pgvector RAG + AI email drafting

## ⚠ One-Time Setup Required
Run `supabase_setup.sql` in Supabase SQL Editor to:
- Enable pgvector
- Create `admission_leads` and `lead_embeddings` tables
- Create `match_leads()` and `get_daily_stats()` functions
- Seed 5 demo leads

## Commands
```bash
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build
```
