import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, FileBarChart2, BookOpen } from 'lucide-react'

const links = [
  { to: '/', label: 'Enquiry Form', icon: BookOpen },
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'Daily Report', icon: FileBarChart2 },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #e8eaf0',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              }}>
                <GraduationCap style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 10, height: 10,
                background: '#34d399', borderRadius: '50%',
                border: '2px solid white',
              }} />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                YS Group
              </span>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                of Institutions
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#f1f5f9', borderRadius: 14, padding: 4,
          }}>
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 16px', borderRadius: 10,
                    fontSize: 13, fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    ...(active
                      ? { background: 'white', color: '#4f46e5', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                      : { background: 'transparent', color: '#64748b' }),
                  }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>


        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </nav>
  )
}
