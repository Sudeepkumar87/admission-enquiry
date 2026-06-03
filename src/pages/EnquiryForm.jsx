import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  User, Phone, Mail, BookOpen, MessageSquare,
  ChevronDown, Loader2, Sparkles, Shield,
  Clock, Users, Star, ArrowRight, CheckCircle
} from 'lucide-react'
import { N8N_WEBHOOK_URL } from '../config'

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)',
]

const SOURCES = [
  'Google Search', 'Social Media', 'Friend/Family Referral',
  'Newspaper Advertisement', 'Walk-in', 'Other'
]

const INITIAL = {
  parentName: '', studentName: '', phone: '', email: '',
  classApplying: '', academicYear: '2025-26', source: '', message: '',
}

export default function EnquiryForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.parentName.trim()) e.parentName = 'Required'
    if (!form.studentName.trim()) e.studentName = 'Required'
    if (!form.phone.trim()) e.phone = 'Required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter valid 10-digit number'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.classApplying) e.classApplying = 'Select a class'
    if (!form.source) e.source = 'Required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setApiError('')
    try {
      await axios.post(N8N_WEBHOOK_URL, {
        ...form,
        submittedAt: new Date().toISOString(),
        status: 'New',
        priority: getPriority(form),
      })
      navigate('/thank-you', { state: { name: form.parentName, studentName: form.studentName } })
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)', padding: '40px 16px' }}>

      {/* Decorative blobs — behind everything, no overflow issues */}
      <div style={{ position: 'fixed', top: 80, left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 80, right: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', fontSize: 12, fontWeight: 600,
            padding: '6px 16px', borderRadius: 999, marginBottom: 16,
            letterSpacing: '0.05em'
          }}>
            <Sparkles size={13} />
             YS GROUP 2025–26
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, margin: '0 0 10px' }}>
            Admission Enquiry
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Fill in the details below. Our AI instantly assigns the right counsellor — response within 24 hours.
          </p>
        </div>

        {/* ── Trust bar ── */}
        {/* <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { icon: Users, text: '2,400+ Admissions' },
            { icon: Clock, text: '< 24hr Response' },
            { icon: Star, text: '4.9 / 5 Rating' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', fontWeight: 500 }}>
              <Icon size={14} color="#6366f1" />
              {text}
            </div>
          ))}
        </div> */}

        {/* ── Form card ── */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(99,102,241,0.1)',
          overflow: 'hidden',
        }}>

          {/* Card top bar */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '20px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>Enquiry Details</h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '2px 0 0' }}>All fields are required unless marked optional</p>
            </div>
          
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

            {/* ── Section: Personal ── */}
            <SectionTitle>Personal Information</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <Field label="Parent / Guardian Name" name="parentName" icon={User}
                placeholder="e.g. Rajesh Kumar" value={form.parentName} error={errors.parentName} onChange={handleChange} />
              <Field label="Student Name" name="studentName" icon={User}
                placeholder="e.g. Priya Kumar" value={form.studentName} error={errors.studentName} onChange={handleChange} />
            </div>

            {/* ── Section: Contact ── */}
            <SectionTitle>Contact Details</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <Field label="Mobile Number" name="phone" icon={Phone} type="tel"
                placeholder="e.g. 9876543210" value={form.phone} error={errors.phone} onChange={handleChange} />
              <Field label="Email Address" name="email" icon={Mail} type="email"
                placeholder="parent@example.com" value={form.email} error={errors.email} onChange={handleChange} />
            </div>

            {/* ── Section: Admission ── */}
            <SectionTitle>Admission Preference</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <SelectField label="Class Applying For" name="classApplying" icon={BookOpen}
                options={CLASSES} value={form.classApplying} error={errors.classApplying}
                onChange={handleChange} placeholder="Select class" />
              <SelectField label="Academic Year" name="academicYear" icon={BookOpen}
                options={['2025-26', '2026-27']} value={form.academicYear} onChange={handleChange} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <SelectField label="How did you hear about us?" name="source" icon={MessageSquare}
                options={SOURCES} value={form.source} error={errors.source}
                onChange={handleChange} placeholder="Select a source" />
            </div>

            {/* ── Message ── */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Message / Questions <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                name="message" rows={3} value={form.message} onChange={handleChange}
                placeholder="Any specific requirements, questions about fees, syllabus, scholarships…"
                style={{
                  width: '100%', padding: '12px 16px', fontSize: 14,
                  border: '1.5px solid #e2e8f0', borderRadius: 12,
                  background: '#f8fafc', color: '#1e293b', resize: 'none',
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
              />
            </div>

            {/* ── Error ── */}
            {apiError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
                {apiError}
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '15px 24px',
                background: loading ? '#818cf8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white', fontSize: 15, fontWeight: 700,
                border: 'none', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
              ) : (
                <>Submit Enquiry <ArrowRight size={16} /></>
              )}
            </button>

            {/* Trust line */}
            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Shield size={12} />
              Secure & encrypted · No spam · We'll call, not email-blast
            </div>

          </form>
        </div>

        {/* ── Bottom badges ── */}
        {/* <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {['CBSE Affiliated', 'ISO 9001:2015', 'NAAC Accredited'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
              <CheckCircle size={13} color="#10b981" />
              {t}
            </div>
          ))}
        </div> */}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ── Helpers ── */

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: 7,
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #e0e7ff, transparent)' }} />
    </div>
  )
}

function Field({ label, name, icon: Icon, type = 'text', placeholder, value, error, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: focused ? '#6366f1' : '#94a3b8',
          display: 'flex', alignItems: 'center', transition: 'color 0.2s',
        }}>
          <Icon size={15} />
        </div>
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
            fontSize: 14, border: `1.5px solid ${error ? '#fca5a5' : focused ? '#6366f1' : '#e2e8f0'}`,
            borderRadius: 12, background: error ? '#fff5f5' : focused ? 'white' : '#f8fafc',
            color: '#1e293b', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
            transition: 'all 0.2s',
          }}
        />
      </div>
      {error && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#ef4444', fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

function SelectField({ label, name, icon: Icon, options, value, error, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: focused ? '#6366f1' : '#94a3b8',
          display: 'flex', alignItems: 'center', zIndex: 1,
        }}>
          <Icon size={15} />
        </div>
        <select
          name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', paddingLeft: 38, paddingRight: 36, paddingTop: 12, paddingBottom: 12,
            fontSize: 14, border: `1.5px solid ${error ? '#fca5a5' : focused ? '#6366f1' : '#e2e8f0'}`,
            borderRadius: 12, background: error ? '#fff5f5' : focused ? 'white' : '#f8fafc',
            color: value ? '#1e293b' : '#94a3b8', fontFamily: 'inherit', outline: 'none',
            appearance: 'none', boxSizing: 'border-box', cursor: 'pointer',
            boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o} value={o} style={{ color: '#1e293b' }}>{o}</option>)}
        </select>
        <div style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: '#94a3b8',
        }}>
          <ChevronDown size={15} />
        </div>
      </div>
      {error && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#ef4444', fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

function getPriority(form) {
  const hi = ['Class 9', 'Class 10', 'Class 11', 'Class 12']
  if (hi.some(c => form.classApplying.startsWith(c)) || (form.message || '').toLowerCase().includes('urgent')) return 'High'
  if (form.source === 'Friend/Family Referral') return 'Medium'
  return 'Normal'
}
