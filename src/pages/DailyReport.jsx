import { useState, useEffect } from 'react'
import {
  BarChart2, TrendingUp, Users, CheckCircle2,
  Download, Mail, Clock, Star, BookOpen, Zap, RefreshCw
} from 'lucide-react'
import axios from 'axios'
import { supabase } from '../supabase'
import { N8N_REPORT_WEBHOOK_URL } from '../config'

const today = new Date()
const formatDate = (d) =>
  d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

function classGroup(cls) {
  if (!cls) return 'Other'
  const c = cls.toLowerCase()
  if (c.includes('nursery') || c.includes('lkg') || c.includes('ukg')) return 'Nursery / LKG / UKG'
  const match = cls.match(/class\s*(\d+)/i)
  if (match) {
    const n = parseInt(match[1])
    if (n <= 5) return 'Class 1–5'
    if (n <= 8) return 'Class 6–8'
    if (n <= 10) return 'Class 9–10'
    return 'Class 11–12'
  }
  return 'Other'
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function computeStats(leads) {
  const todayStart = new Date(today.toISOString().split('T')[0] + 'T00:00:00')
  const total = leads.length
  const newToday = leads.filter(l => new Date(l.submittedAt) >= todayStart).length
  const newStatus = leads.filter(l => l.status === 'New').length
  const contacted = leads.filter(l => l.status === 'Contacted').length
  const admitted = leads.filter(l => l.status === 'Admitted').length
  const notInterested = leads.filter(l => l.status === 'Not Interested').length
  const followUpPending = leads.filter(l => l.status === 'Follow-up Pending').length
  const highPriority = leads.filter(l => l.priority === 'High').length
  const conversionRate = total > 0 ? ((admitted / total) * 100).toFixed(1) + '%' : '0%'

  const classMap = {}
  leads.forEach(l => { const g = classGroup(l.classApplying); classMap[g] = (classMap[g] || 0) + 1 })
  const classOrder = ['Nursery / LKG / UKG', 'Class 1–5', 'Class 6–8', 'Class 9–10', 'Class 11–12']
  const byClass = classOrder.map(c => ({ class: c, count: classMap[c] || 0 })).filter(c => c.count > 0)

  const sourceMap = {}
  leads.forEach(l => { const s = l.source || 'Unknown'; sourceMap[s] = (sourceMap[s] || 0) + 1 })
  const bySource = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }))
  const topSource = bySource[0]?.source || 'N/A'

  const assigneeMap = {}
  leads.forEach(l => {
    const name = l.assignedTo || 'Unassigned'
    if (!assigneeMap[name]) assigneeMap[name] = { assigned: 0, admitted: 0 }
    assigneeMap[name].assigned++
    if (l.status === 'Admitted') assigneeMap[name].admitted++
  })
  const byAssignee = Object.entries(assigneeMap).map(([name, v]) => ({ name, ...v }))

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5)

  return { total, newToday, newStatus, contacted, admitted, notInterested, followUpPending, highPriority, conversionRate, topSource, byClass, bySource, byAssignee, recentLeads }
}

const FALLBACK_LEADS = [
  { id: '1', parentName: 'Rajesh Kumar', studentName: 'Priya Kumar', classApplying: 'Class 6', source: 'Google Search', status: 'New', priority: 'Normal', assignedTo: 'Sunita Sharma', submittedAt: new Date().toISOString() },
  { id: '2', parentName: 'Meena Patel', studentName: 'Arjun Patel', classApplying: 'Class 10', source: 'Friend/Family Referral', status: 'Contacted', priority: 'High', assignedTo: 'Vikram Singh', submittedAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '3', parentName: 'Suresh Nair', studentName: 'Kavya Nair', classApplying: 'Nursery', source: 'Social Media', status: 'New', priority: 'Normal', assignedTo: 'Sunita Sharma', submittedAt: new Date(Date.now() - 21600000).toISOString() },
  { id: '4', parentName: 'Anjali Singh', studentName: 'Rohan Singh', classApplying: 'Class 12 (Science)', source: 'Walk-in', status: 'Admitted', priority: 'High', assignedTo: 'Vikram Singh', submittedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', parentName: 'Prakash Joshi', studentName: 'Ananya Joshi', classApplying: 'Class 3', source: 'Newspaper Advertisement', status: 'Follow-up Pending', priority: 'Medium', assignedTo: 'Sunita Sharma', submittedAt: new Date(Date.now() - 172800000).toISOString() },
]

export default function DailyReport() {
  const [leads, setLeads] = useState(FALLBACK_LEADS)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('admission_leads')
        .select('*')
        .order('submitted_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setLeads(data.map(r => ({
          id: r.id,
          parentName: r.parent_name,
          studentName: r.student_name,
          classApplying: r.class_applying,
          source: r.source,
          status: r.status,
          priority: r.priority,
          assignedTo: r.assigned_to,
          submittedAt: r.submitted_at,
        })))
      }
    } catch { /* keep fallback */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeads() }, [])

  const stats = computeStats(leads)
  const maxClass = Math.max(...stats.byClass.map(b => b.count), 1)
  const topClass = [...stats.byClass].sort((a, b) => b.count - a.count)[0]

  const aiSummary = `Today's admission pipeline has ${stats.total} total lead${stats.total !== 1 ? 's' : ''} with ${stats.newToday} new enquir${stats.newToday !== 1 ? 'ies' : 'y'} submitted today. ${stats.topSource} is the top lead source. ${stats.highPriority > 0 ? `${stats.highPriority} high-priority lead${stats.highPriority > 1 ? 's' : ''} need immediate follow-up.` : 'No high-priority leads pending.'} ${topClass ? `${topClass.class} segment shows highest demand with ${topClass.count} enquiries.` : ''} Overall conversion rate stands at ${stats.conversionRate}. Recommend calling high-priority leads before 5 PM today.`

  const triggerEmailReport = async () => {
    setSending(true)
    try {
      await axios.post(N8N_REPORT_WEBHOOK_URL, { triggerReport: true, date: today.toISOString().split('T')[0] })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch {
      alert('Could not trigger report email. Check n8n workflow.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Daily Admissions Report</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock style={{ width: 13, height: 13 }} />
            {formatDate(today)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={fetchLeads} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer' }}>
            <RefreshCw style={{ width: 14, height: 14, color: '#64748b', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button onClick={triggerEmailReport} disabled={sending || emailSent} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: emailSent ? '#d1fae5' : '#2563eb', color: emailSent ? '#065f46' : 'white' }}>
            <Mail style={{ width: 14, height: 14 }} />
            {emailSent ? 'Report Sent!' : sending ? 'Sending...' : 'Email Report'}
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <Download style={{ width: 14, height: 14 }} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <KpiCard label="Total Leads" value={stats.total} sub="All time" icon={Users} color="blue" />
        <KpiCard label="New Today" value={stats.newToday} sub="Submitted today" icon={TrendingUp} color="indigo" />
        <KpiCard label="Admissions" value={stats.admitted} sub={`${stats.conversionRate} conversion`} icon={CheckCircle2} color="green" />
        <KpiCard label="High Priority" value={stats.highPriority} sub="Need immediate follow-up" icon={Star} color="red" />
      </div>

      {/* Status + Class */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={cardStyle}>
          <SectionTitle icon={BarChart2} color="#3b82f6">Status Breakdown</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'New', value: stats.newStatus, color: '#3b82f6' },
              { label: 'Contacted', value: stats.contacted, color: '#eab308' },
              { label: 'Follow-up Pending', value: stats.followUpPending, color: '#f97316' },
              { label: 'Admitted', value: stats.admitted, color: '#22c55e' },
              { label: 'Not Interested', value: stats.notInterested, color: '#cbd5e1' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#475569' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{value}</span>
                </div>
                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: color, borderRadius: 999, width: stats.total > 0 ? `${(value / stats.total) * 100}%` : '0%', transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <SectionTitle icon={BookOpen} color="#6366f1">Enquiries by Class Group</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.byClass.map(({ class: cls, count }) => (
              <div key={cls}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#475569' }}>{cls}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{count}</span>
                </div>
                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#6366f1', borderRadius: 999, width: `${(count / maxClass) * 100}%`, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sources + Team */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        <div style={cardStyle}>
          <SectionTitle icon={Zap} color="#eab308">Lead Sources</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.bySource.map(({ source, count }) => (
              <div key={source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: '#475569' }}>{source}</span>
                <span style={{ fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '2px 10px', borderRadius: 8 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <SectionTitle icon={Users} color="#22c55e">Team Performance</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #f1f5f9' }}>
                {['Counsellor', 'Leads Assigned', 'Admissions', 'Conversion'].map((h, i) => (
                  <th key={h} style={{ padding: '6px 0 10px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.byAssignee.map(({ name, assigned, admitted }) => (
                <tr key={name} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: '#1e293b' }}>{name}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#374151' }}>{assigned}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{admitted}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#64748b' }}>{assigned > 0 ? ((admitted / assigned) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div style={cardStyle}>
        <SectionTitle icon={Users} color="#6366f1">Recent Enquiries</SectionTitle>
        <div>
          {stats.recentLeads.map((lead, i) => {
            const statusColors = {
              'New': { bg: '#eff6ff', color: '#1d4ed8' },
              'Admitted': { bg: '#f0fdf4', color: '#15803d' },
              'Contacted': { bg: '#fefce8', color: '#a16207' },
            }
            const sc = statusColors[lead.status] || { bg: '#fff7ed', color: '#c2410c' }
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.recentLeads.length - 1 ? '1px solid #f8fafc' : 'none', fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{lead.parentName}</span>
                  <span style={{ color: '#94a3b8', marginLeft: 8 }}>{lead.classApplying}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{lead.status}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{timeAgo(lead.submittedAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Summary */}
      <div style={{ marginTop: 16, background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', borderRadius: 18, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Zap style={{ width: 15, height: 15, color: 'white' }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>AI Summary</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{aiSummary}</p>
      </div>

    </div>
  )
}

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  border: '1.5px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  padding: '20px 20px 18px',
  marginBottom: 0,
}

function SectionTitle({ icon: Icon, color, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Icon style={{ width: 15, height: 15, color }} />
      <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{children}</span>
    </div>
  )
}

function KpiCard({ label, value, sub, icon: Icon, color }) {
  const palette = {
    blue:   { bg: '#eff6ff', icon: '#3b82f6', border: '#bfdbfe' },
    indigo: { bg: '#eef2ff', icon: '#6366f1', border: '#c7d2fe' },
    green:  { bg: '#f0fdf4', icon: '#22c55e', border: '#bbf7d0' },
    red:    { bg: '#fef2f2', icon: '#ef4444', border: '#fecaca' },
  }
  const p = palette[color]
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '20px 20px 18px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: p.bg, border: `1.5px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon style={{ width: 20, height: 20, color: p.icon }} />
      </div>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '5px 0 2px', fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{sub}</p>
    </div>
  )
}
