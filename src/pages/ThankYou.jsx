import { useLocation, Link } from 'react-router-dom'
import { CheckCircle2, Phone, Clock, ArrowLeft, Brain, PhoneCall } from 'lucide-react'

export default function ThankYou() {
  const { state } = useLocation()
  const parentName = state?.name || 'Parent'
  const studentName = state?.studentName || 'your child'

  const steps = [

    {
      icon: CheckCircle2,
      title: 'Counsellor assigned via AI',
      sub: 'Smart assignment based on class & priority',
      done: true,
    },
    {
      icon: PhoneCall,
      title: 'Follow-up call within 24h',
      sub: 'Keep your phone available',
      done: false,
    },
  ]

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Confetti */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          {/* {[
            { color: '#818cf8', rot: -24 },
            { color: '#f472b6', rot: -12 },
            { color: '#fbbf24', rot: 0 },
            { color: '#34d399', rot: 12 },
            { color: '#a78bfa', rot: 24 },
          ].map(({ color, rot }, i) => (
            <div key={i} style={{
              width: 6, height: 32,
              background: color,
              borderRadius: 999,
              opacity: 0.75,
              transform: `rotate(${rot}deg)`,
            }} />
          ))} */}
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 28,
          boxShadow: '0 24px 64px rgba(99,102,241,0.15), 0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(99,102,241,0.1)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)',
            padding: '36px 32px',
            textAlign: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 64, height: 64,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              backdropFilter: 'blur(8px)',
            }}>
              <CheckCircle2 size={32} color="white" />
            </div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>
              Enquiry Submitted!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: 0 }}>
              We've got your details, {parentName}
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 28px 24px' }}>

            {/* Student chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#f0f4ff',
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 16,
            }}>
              <div style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontSize: 16,
                fontWeight: 700,
              }}>
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{studentName}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Application received · Being processed now</p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: '#d1fae5',
                color: '#065f46',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
              }}>
                <span style={{
                  width: 6, height: 6,
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }} />
                Live
              </div>
            </div>

            {/* AI note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)',
              border: '1px solid #e0e7ff',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 20,
            }}>
              <Brain size={16} color="#7c3aed" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
                <strong style={{ color: '#6d28d9' }}></strong> Our system matched your enquiry with similar past leads and assigned the best-fit counsellor automatically.
              </p>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: 20 }}>
              {steps.map(({ icon: Icon, title, sub, done }, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i < steps.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: done ? '#d1fae5' : '#f1f5f9',
                    border: done ? '2px solid #6ee7b7' : '2px solid #e2e8f0',
                  }}>
                    <Icon size={15} color={done ? '#059669' : '#94a3b8'} />
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: done ? '#1e293b' : '#64748b',
                    }}>{title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{sub}</p>
                  </div>
                  {done && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#059669',
                      background: '#d1fae5',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}>Done</span>
                  )}
                </div>
              ))}
            </div>

            {/* Info row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { icon: Clock, color: '#3b82f6', bg: '#eff6ff', label: 'Response', val: 'Within 24 hours' },
                { icon: Phone, color: '#10b981', bg: '#f0fdf4', label: 'Helpline', val: '+91 98765 43210' },
              ].map(({ icon: Icon, color, bg, label, val }) => (
                <div key={label} style={{
                  background: bg,
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 34, height: 34,
                    background: 'white',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#374151' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit another */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px',
                border: '2px dashed #e2e8f0',
                borderRadius: 14,
                fontSize: 13,
                color: '#64748b',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
            >
              <ArrowLeft size={14} />
              Submit another enquiry
            </Link>

          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}
