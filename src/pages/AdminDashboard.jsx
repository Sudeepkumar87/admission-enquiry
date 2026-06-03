import { useState, useEffect } from 'react'
import {
  Users, TrendingUp, Clock, CheckCircle2,
  Search, Filter, RefreshCw, Eye, Phone,
  AlertCircle, Star, ChevronDown, Database
} from 'lucide-react'
import { supabase } from '../supabase'

const MOCK_LEADS = [
  {
    id: '1', parentName: 'Rajesh Kumar', studentName: 'Priya Kumar',
    phone: '9876543210', email: 'rajesh@example.com', classApplying: 'Class 6',
    academicYear: '2025-26', source: 'Google Search', message: 'Interested in science stream',
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'New', priority: 'Normal', assignedTo: 'Sunita Sharma',
  },
  {
    id: '2', parentName: 'Meena Patel', studentName: 'Arjun Patel',
    phone: '8765432109', email: 'meena@example.com', classApplying: 'Class 10',
    academicYear: '2025-26', source: 'Friend/Family Referral', message: 'Urgent admission needed',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'Contacted', priority: 'High', assignedTo: 'Vikram Singh',
  },
  {
    id: '3', parentName: 'Suresh Nair', studentName: 'Kavya Nair',
    phone: '7654321098', email: 'suresh@example.com', classApplying: 'Nursery',
    academicYear: '2026-27', source: 'Social Media', message: '',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'New', priority: 'Normal', assignedTo: 'Sunita Sharma',
  },
  {
    id: '4', parentName: 'Anjali Singh', studentName: 'Rohan Singh',
    phone: '6543210987', email: 'anjali@example.com', classApplying: 'Class 12 (Science)',
    academicYear: '2025-26', source: 'Walk-in', message: 'Needs scholarship info',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'Admitted', priority: 'High', assignedTo: 'Vikram Singh',
  },
  {
    id: '5', parentName: 'Prakash Joshi', studentName: 'Ananya Joshi',
    phone: '9988776655', email: 'prakash@example.com', classApplying: 'Class 3',
    academicYear: '2025-26', source: 'Newspaper Advertisement', message: '',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Follow-up Pending', priority: 'Medium', assignedTo: 'Sunita Sharma',
  },
]

const STATUS_CONFIG = {
  'New': { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'Contacted': { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'Follow-up Pending': { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  'Admitted': { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Not Interested': { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
}

const PRIORITY_CONFIG = {
  High: 'text-red-600',
  Medium: 'text-yellow-600',
  Normal: 'text-gray-500',
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [dbStatus, setDbStatus] = useState('checking') // 'checking' | 'live' | 'setup-needed'

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('admission_leads')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(100)

      if (error) {
        // Table doesn't exist yet — show setup banner but keep mock data
        setDbStatus('setup-needed')
      } else if (data && data.length > 0) {
        setDbStatus('live')
        setLeads(data.map(r => ({
          id: r.id,
          leadId: r.lead_id,
          parentName: r.parent_name,
          studentName: r.student_name,
          phone: r.phone,
          email: r.email,
          classApplying: r.class_applying,
          academicYear: r.academic_year,
          source: r.source,
          message: r.message,
          status: r.status,
          priority: r.priority,
          assignedTo: r.assigned_to,
          submittedAt: r.submitted_at,
        })))
      } else {
        setDbStatus('live') // table exists, just empty
      }
    } catch {
      setDbStatus('setup-needed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [])

  const filtered = leads.filter(l => {
    const matchSearch =
      l.parentName.toLowerCase().includes(search.toLowerCase()) ||
      l.studentName.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.classApplying.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    admitted: leads.filter(l => l.status === 'Admitted').length,
    highPriority: leads.filter(l => l.priority === 'High').length,
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all admission enquiries</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
            padding: '6px 12px', borderRadius: 10, border: '1.5px solid',
            ...(dbStatus === 'live'
              ? { color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }
              : dbStatus === 'setup-needed'
              ? { color: '#d97706', background: '#fffbeb', borderColor: '#fde68a' }
              : { color: '#64748b', background: '#f8fafc', borderColor: '#e2e8f0' }),
          }}>
            <Database style={{ width: 13, height: 13 }} />
            {dbStatus === 'live' ? 'Supabase Live' : dbStatus === 'setup-needed' ? 'Setup Needed' : 'Connecting…'}
          </span>
          <button
            onClick={fetchLeads}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', background: '#2563eb', color: 'white',
              fontSize: 13, fontWeight: 600, borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(37,99,235,0.3)',
            }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Leads" value={stats.total} icon={Users} color="blue" />
        <StatCard label="New Today" value={stats.new} icon={TrendingUp} color="indigo" />
        <StatCard label="Follow-ups Due" value={stats.contacted} icon={Clock} color="orange" />
        <StatCard label="Admitted" value={stats.admitted} icon={CheckCircle2} color="green" />
      </div>

      {/* Supabase setup banner */}
      {dbStatus === 'setup-needed' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-semibold">Supabase table not set up yet</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Run <strong>supabase_setup.sql</strong> in your{' '}
              <a href="https://supabase.com/dashboard/project/nrbrmtvivpyqnsmfdhhr/sql/new" target="_blank" rel="noreferrer" className="underline font-semibold">
                Supabase SQL Editor
              </a>
              {' '}to create the tables. Showing demo data until then.
            </p>
          </div>
        </div>
      )}

  
     

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, class..."
            style={{
              width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13,
              background: 'white', color: '#1e293b', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative', minWidth: 160 }}>
          <Filter style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none', zIndex: 1,
          }} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 32, paddingTop: 10, paddingBottom: 10,
              border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13,
              background: 'white', color: filterStatus === 'All' ? '#64748b' : '#1e293b',
              outline: 'none', appearance: 'none', fontFamily: 'inherit', cursor: 'pointer',
              boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#6366f1' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
          >
            <option value="All">All Status</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '480px' }}>
          <table style={{ minWidth: 900, width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                {['Parent / Student', 'Contact', 'Class', 'Priority', 'Status', 'Assigned To', 'Time', 'Action'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: i === 7 ? 'right' : 'left',
                    fontWeight: 700,
                    fontSize: 11,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    background: '#f8fafc',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8', fontSize: 14 }}>
                    No leads found
                  </td>
                </tr>
              ) : filtered.map((lead, idx) => (
                <tr key={lead.id} style={{
                  background: idx % 2 === 0 ? 'white' : '#fafafa',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'}
                >
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{lead.parentName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{lead.studentName}</p>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <p style={{ margin: 0, color: '#374151', fontSize: 13 }}>{lead.phone}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginTop: 1, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.email}</p>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#374151', whiteSpace: 'nowrap', fontSize: 13 }}>{lead.classApplying}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontWeight: 600, fontSize: 12,
                      color: lead.priority === 'High' ? '#dc2626' : lead.priority === 'Medium' ? '#d97706' : '#64748b',
                    }}>
                      {lead.priority === 'High' && <Star className="w-3 h-3 fill-current" />}
                      {lead.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    }} className={STATUS_CONFIG[lead.status]?.color || 'bg-gray-100 text-gray-600'}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0 }}
                        className={STATUS_CONFIG[lead.status]?.dot || 'bg-gray-400'} />
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap', fontSize: 13 }}>{lead.assignedTo}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: 12 }}>{timeAgo(lead.submittedAt)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setSelected(lead)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        color: '#3b82f6', fontSize: 12, fontWeight: 600,
                        background: '#eff6ff', border: 'none', borderRadius: 8,
                        padding: '5px 10px', cursor: 'pointer',
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          fontSize: 12,
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Showing <strong style={{ color: '#374151' }}>{filtered.length}</strong> of <strong style={{ color: '#374151' }}>{leads.length}</strong> leads</span>
          <span>{leads.filter(l => l.status === 'New').length} new · {leads.filter(l => l.priority === 'High').length} high priority</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <LeadModal lead={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  const palette = {
    blue:   { bg: '#eff6ff', icon: '#3b82f6', border: '#bfdbfe' },
    indigo: { bg: '#eef2ff', icon: '#6366f1', border: '#c7d2fe' },
    orange: { bg: '#fff7ed', icon: '#f97316', border: '#fed7aa' },
    green:  { bg: '#f0fdf4', icon: '#22c55e', border: '#bbf7d0' },
  }
  const p = palette[color]
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      border: '1.5px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '20px 20px 18px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: p.bg, border: `1.5px solid ${p.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <Icon style={{ width: 20, height: 20, color: p.icon }} />
      </div>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 500, color: '#64748b' }}>{label}</p>
    </div>
  )
}

function LeadModal({ lead, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 text-lg">Lead Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>
        <div className="space-y-3 text-sm">
          <Row label="Parent Name" value={lead.parentName} />
          <Row label="Student Name" value={lead.studentName} />
          <Row label="Phone" value={lead.phone} />
          <Row label="Email" value={lead.email} />
          <Row label="Class" value={`${lead.classApplying} (${lead.academicYear})`} />
          <Row label="Source" value={lead.source} />
          <Row label="Priority" value={lead.priority} />
          <Row label="Status" value={lead.status} />
          <Row label="Assigned To" value={lead.assignedTo} />
          <Row label="Submitted" value={new Date(lead.submittedAt).toLocaleString('en-IN')} />
          {lead.message && <Row label="Message" value={lead.message} />}
        </div>
        <div className="flex gap-2 mt-5">
          <a
            href={`tel:${lead.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
