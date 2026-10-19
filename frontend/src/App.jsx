import { useEffect, useMemo, useState } from 'react'
import { api, clearSession, getSession, setSession } from './api'

const navigation = {
  PATIENT: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'book', label: 'Book a visit', icon: 'calendar' },
    { id: 'history', label: 'Visits & notes', icon: 'file' },
  ],
  DOCTOR: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'availability', label: 'Availability', icon: 'clock' },
    { id: 'notes', label: 'Appointments & notes', icon: 'file' },
  ],
  ADMIN: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'team', label: 'Care team', icon: 'users' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar' },
  ],
}

const iconShapes = {
  brand: (
    <>
      <path d="M12 3.2 19 6v5.2c0 4.4-2.9 7.8-7 9.6-4.1-1.8-7-5.2-7-9.6V6l7-2.8Z" />
      <path d="M12 8v7M8.5 11.5h7" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h3M8 16.5h3M14.5 13h2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  file: (
    <>
      <path d="M7 3.5h7l4.5 4.6v12.4H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
      <path d="M14 3.5v5h4.5M8.5 13h7M8.5 16.5h7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19v-1.4a5.5 5.5 0 0 1 11 0V19M16 5.2a3.2 3.2 0 0 1 0 6.2M17.2 14a4.8 4.8 0 0 1 3.3 4.6V19" />
    </>
  ),
  arrow: <path d="M4.5 12h15m-6-6 6 6-6 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  signout: (
    <>
      <path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10M14.5 8l4 4-4 4M8.5 12h10" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 19 6v5.2c0 4.4-2.9 7.8-7 9.6-4.1-1.8-7-5.2-7-9.6V6l7-2.8Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.3 4.2L19 7" />,
  heart: <path d="M20.5 8.8c0 5-8.5 10.2-8.5 10.2S3.5 13.8 3.5 8.8A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 8.5 1.6Z" />,
  sparkle: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
}

function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconShapes[name] || iconShapes.sparkle}
    </svg>
  )
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark"><Icon name="brand" size={21} /></span>
      <span>med<span className="brand-light">vault</span></span>
    </div>
  )
}

function getInitials(value = '') {
  const name = value.split('@')[0].replace(/[._-]+/g, ' ').trim()
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'MV'
}

function firstName(value = '') {
  const localPart = value.split('@')[0] || 'there'
  const word = localPart.split(/[._-]/)[0]
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : 'there'
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(value, options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', ...options })
}

function formatDateOnly(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function formatDay(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { day: '2-digit' })
}

function formatMonth(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short' })
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function toLocalInput(date) {
  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function nextDayAtNine() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(9, 0, 0, 0)
  return date
}

function StatusPill({ status }) {
  const value = (status || 'UNKNOWN').toUpperCase()
  const className = value === 'CONFIRMED' || value === 'COMPLETED'
    ? 'status-good'
    : value === 'CANCELLED'
      ? 'status-muted'
      : 'status-waiting'
  return <span className={`status-pill ${className}`}><span />{value.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())}</span>
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  )
}

function StatCard({ icon, label, value, detail, tone = 'mint' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon icon-${tone}`}><Icon name={icon} size={19} /></div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function SectionTitle({ title, description, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

function EmptyState({ icon = 'calendar', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  )
}

function AppointmentCard({ item, personLabel, onCancel, cancelBusy = false }) {
  return (
    <article className="appointment-card">
      <div className="appointment-date">
        <strong>{formatDay(item.startTime)}</strong>
        <span>{formatMonth(item.startTime)}</span>
      </div>
      <div className="appointment-main">
        <div className="appointment-title-row">
          <h3>{personLabel === 'Patient' ? item.patientName : item.doctorName || 'Care team'}</h3>
          <StatusPill status={item.status} />
        </div>
        <p className="appointment-detail">
          <Icon name="clock" size={15} />
          {formatDate(item.startTime)}
          {item.endTime && <span className="appointment-end"> · until {formatTime(item.endTime)}</span>}
        </p>
        {item.notes?.length > 0 && (
          <div className="appointment-notes">
            {item.notes.map((note) => (
              <p key={note.id}><Icon name="file" size={14} />{note.content}<span> · {note.authorEmail}</span></p>
            ))}
          </div>
        )}
      </div>
      {onCancel && item.status !== 'CANCELLED' && (
        <button className="button button-quiet button-small" disabled={cancelBusy} onClick={() => onCancel(item.id)}>
          {cancelBusy ? 'Cancelling…' : 'Cancel'}
        </button>
      )}
    </article>
  )
}

export default function App() {
  const [session, setSessionState] = useState(() => getSession())
  const [view, setView] = useState('overview')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timer)
  }, [notice])

  function signIn(next) {
    setSession(next)
    setSessionState(next)
    setView('overview')
    setError('')
    setNotice('You’re signed in')
  }

  function signOut() {
    clearSession()
    setSessionState(null)
    setView('overview')
    setError('')
    setNotice('')
  }

  if (!session) return <AuthScreen onAuthenticated={signIn} />

  const role = navigation[session.role] ? session.role : 'PATIENT'
  const menu = navigation[role]
  const activeItem = menu.find((item) => item.id === view) || menu[0]
  const displayTitle = view === 'overview' ? `${greeting()}, ${firstName(session.email)}` : activeItem.label
  const description = {
    PATIENT: {
      overview: 'Your appointments and care details, all together.',
      book: 'Choose a doctor and find a time that works for you.',
      history: 'Review past visits, appointment status, and clinical notes.',
    },
    DOCTOR: {
      overview: 'A clear view of your schedule and today’s appointments.',
      availability: 'Publish appointment times for patients to book.',
      notes: 'Review confirmed appointments and add clinical notes.',
    },
    ADMIN: {
      overview: 'A snapshot of appointments and the people in your care network.',
      team: 'Manage doctor accounts and review registered patients.',
      appointments: 'View appointment activity across MedVault.',
    },
  }[role][view] || ''

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="workspace-dot" />
          <span>Care workspace</span>
          <span className="workspace-chevron"><Icon name="chevron" size={14} /></span>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {menu.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${view === item.id ? 'nav-link-active' : ''}`}
              onClick={() => { setView(item.id); setError('') }}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {view === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note">
            <span className="secure-icon"><Icon name="shield" size={17} /></span>
            <div><strong>Private workspace</strong><span>Access is role-based</span></div>
          </div>
          <div className="sidebar-profile">
            <span className="avatar">{getInitials(session.email)}</span>
            <span className="profile-copy"><strong>{session.email}</strong><small>{role.toLowerCase()}</small></span>
            <button className="icon-button logout-button" aria-label="Sign out" title="Sign out" onClick={signOut}>
              <Icon name="signout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activeItem.label}</strong></div>
          <div className="topbar-right">
            <span className="today-label">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="topbar-avatar">{getInitials(session.email)}</span>
          </div>
        </header>
        <div className="main-content">
          <PageHeading
            eyebrow={role === 'ADMIN' ? 'Administration' : role === 'DOCTOR' ? 'Clinical workspace' : 'Patient portal'}
            title={displayTitle}
            description={description}
          />
          {error && <div className="feedback feedback-error" role="alert"><span>{error}</span><button className="feedback-close" onClick={() => setError('')} aria-label="Dismiss error"><Icon name="close" size={16} /></button></div>}
          {notice && <div className="feedback feedback-success" role="status"><Icon name="check" size={17} /><span>{notice}</span><button className="feedback-close" onClick={() => setNotice('')} aria-label="Dismiss message"><Icon name="close" size={16} /></button></div>}

          {role === 'PATIENT' && (
            <PatientDesk
              session={session}
              view={view}
              onNavigate={setView}
              setError={setError}
              setNotice={setNotice}
            />
          )}
          {role === 'DOCTOR' && (
            <DoctorDesk
              session={session}
              view={view}
              onNavigate={setView}
              setError={setError}
              setNotice={setNotice}
            />
          )}
          {role === 'ADMIN' && (
            <AdminDesk
              view={view}
              onNavigate={setView}
              setError={setError}
              setNotice={setNotice}
            />
          )}
        </div>
        <footer className="main-footer"><span>MedVault</span><span>Care, connected.</span></footer>
      </main>
    </div>
  )
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'register') {
        await api.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      }
      const result = await api.login({ email: form.email.trim(), password: form.password })
      onAuthenticated(result)
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <div className="auth-layout">
      <section className="auth-story">
        <div className="auth-story-inner">
          <Brand />
          <div className="story-content">
            <span className="story-kicker"><span /> CARE, CONNECTED</span>
            <h1>Your care,<br /><em>thoughtfully</em> organized.</h1>
            <p>One secure place to manage appointments, connect with your care team, and keep the details that matter close.</p>
            <div className="story-feature">
              <span><Icon name="calendar" size={18} /></span>
              <div><strong>Appointments made simpler</strong><small>Find availability and keep track of every visit.</small></div>
            </div>
            <div className="story-feature">
              <span><Icon name="shield" size={18} /></span>
              <div><strong>Designed around your role</strong><small>Patients, doctors, and admins each see what they need.</small></div>
            </div>
          </div>
          <div className="story-bottom"><span><Icon name="heart" size={16} /> Thoughtful tools for better care</span><span>© MedVault</span></div>
        </div>
        <div className="story-orb story-orb-one" />
        <div className="story-orb story-orb-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><Brand compact /></div>
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
            <h2>{mode === 'login' ? 'Sign in to MedVault' : 'Create your account'}</h2>
            <p>{mode === 'login' ? 'Enter your details to access your care workspace.' : 'Create a patient account to book your first visit.'}</p>
          </div>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'auth-tab-active' : ''} onClick={() => switchMode('login')}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'auth-tab-active' : ''} onClick={() => switchMode('register')}>Create account</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <label className="field">
                <span>Full name</span>
                <input
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </label>
            )}
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            {error && <div className="auth-error" role="alert"><Icon name="shield" size={16} />{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy}>
              {busy ? <><span className="button-spinner" />{mode === 'login' ? 'Signing in…' : 'Creating account…'}</> : <>{mode === 'login' ? 'Sign in' : 'Create patient account'}<Icon name="arrow" size={17} /></>}
            </button>
          </form>
          <p className="auth-assurance"><Icon name="shield" size={15} /> Your account is protected with secure sign-in.</p>
        </div>
        <div className="auth-panel-footer">Need access? Contact your MedVault administrator.</div>
      </section>
    </div>
  )
}

function PatientDesk({ session, view, onNavigate, setError, setNotice }) {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [slots, setSlots] = useState([])
  const [history, setHistory] = useState({ appointments: [] })
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [dateFilter, setDateFilter] = useState('')

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const [doctorList, patientHistory] = await Promise.all([
        api.doctors(),
        session.patientId ? api.history(session.patientId) : Promise.resolve({ appointments: [] }),
      ])
      setDoctors(doctorList || [])
      setHistory(patientHistory || { appointments: [] })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [session.patientId])

  async function loadSlots(id) {
    setDoctorId(id)
    setError('')
    if (!id) {
      setSlots([])
      return
    }
    setSlotsLoading(true)
    try {
      setSlots(await api.availableSlots(id) || [])
    } catch (err) {
      setError(err.message)
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  async function book(slotId) {
    setActionId(slotId)
    setError('')
    try {
      await api.book({ slotId })
      setNotice('Your appointment is booked')
      await refresh()
      if (doctorId) await loadSlots(doctorId)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  async function cancel(id) {
    const item = history.appointments?.find((appointment) => appointment.id === id)
    if (!window.confirm(`Cancel your appointment${item?.doctorName ? ` with ${item.doctorName}` : ''}?`)) return
    setActionId(id)
    setError('')
    try {
      await api.cancel(id)
      setNotice('Appointment cancelled')
      await refresh()
      if (doctorId) await loadSlots(doctorId)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const appointments = history?.appointments || []
  const upcoming = appointments
    .filter((item) => item.status !== 'CANCELLED' && new Date(item.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  const past = [...appointments].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  const doctor = doctors.find((item) => String(item.id) === String(doctorId))
  const visibleSlots = slots
    .filter((slot) => !dateFilter || String(slot.startTime || '').slice(0, 10) === dateFilter)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  if (view === 'book') {
    return (
      <div className="page-stack">
        <section className="panel booking-panel">
          <SectionTitle title="Find a time that works" description="Availability is shown in your local time." />
          <div className="booking-filters">
            <label className="field">
              <span>Choose a doctor</span>
              <select value={doctorId} onChange={(event) => loadSlots(event.target.value)}>
                <option value="">Select a care provider</option>
                {doctors.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.specialization}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Filter by date <small>Optional</small></span>
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
            </label>
          </div>
          {slotsLoading ? <div className="inline-loading"><span className="button-spinner" />Loading availability…</div> : (
            doctorId ? (
              <>
                <div className="results-caption">
                  <div><strong>{doctor?.name || 'Available appointments'}</strong><span>{doctor?.specialization}</span></div>
                  <span>{visibleSlots.length} {visibleSlots.length === 1 ? 'time' : 'times'} available</span>
                </div>
                {visibleSlots.length ? (
                  <div className="slot-grid">
                    {visibleSlots.map((slot) => (
                      <article className="slot-card" key={slot.id}>
                        <div className="slot-date"><Icon name="calendar" size={16} /><span>{formatDateOnly(slot.startTime)}</span></div>
                        <strong>{formatTime(slot.startTime)}</strong>
                        <span className="slot-duration">Until {formatTime(slot.endTime)}</span>
                        <button className="button button-primary button-full" disabled={actionId === slot.id} onClick={() => book(slot.id)}>
                          {actionId === slot.id ? 'Booking…' : 'Book this time'}
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="clock" title="No times found" description={dateFilter ? 'Try a different date, or clear the date filter.' : 'This doctor has no open appointments right now.'} action={dateFilter ? <button className="button button-quiet" onClick={() => setDateFilter('')}>Clear date filter</button> : null} />
                )}
              </>
            ) : (
              <EmptyState icon="calendar" title="Choose a doctor to get started" description="Their open appointment times will appear here." />
            )
          )}
        </section>
      </div>
    )
  }

  if (view === 'history') {
    return (
      <section className="panel">
        <SectionTitle title="Your visits" description="Appointments and notes shared by your care team." />
        {loading ? <div className="loading-list"><span className="button-spinner" />Loading your history…</div> : past.length ? (
          <div className="appointment-list">
            {past.map((item) => <AppointmentCard key={item.id} item={item} personLabel="Doctor" onCancel={cancel} cancelBusy={actionId === item.id} />)}
          </div>
        ) : (
          <EmptyState icon="file" title="Your history is clear" description="Once you book a visit, appointment details and clinical notes will appear here." action={<button className="button button-primary" onClick={() => onNavigate('book')}>Find a doctor<Icon name="arrow" size={16} /></button>} />
        )}
      </section>
    )
  }

  return (
    <div className="page-stack">
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-kicker"><Icon name="sparkle" size={15} /> YOUR HEALTH, IN ONE PLACE</span>
          <h2>Take care of what matters.</h2>
          <p>Book a visit, check your next appointment, and keep up with your care team.</p>
          <button className="button button-light" onClick={() => onNavigate('book')}>Book an appointment<Icon name="arrow" size={17} /></button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-ring art-ring-one" />
          <div className="art-ring art-ring-two" />
          <span className="art-cross"><Icon name="brand" size={70} /></span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard icon="calendar" label="Upcoming visits" value={loading ? '—' : upcoming.length} detail="Scheduled appointments" tone="mint" />
        <StatCard icon="file" label="Total visits" value={loading ? '—' : appointments.length} detail="In your care history" tone="blue" />
        <StatCard icon="users" label="Care providers" value={loading ? '—' : doctors.length} detail="Available in MedVault" tone="peach" />
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <SectionTitle
            title="Your next visit"
            description="Your soonest upcoming appointment."
            action={<button className="text-button" onClick={() => onNavigate('history')}>View all<Icon name="arrow" size={15} /></button>}
          />
          {loading ? <div className="loading-list"><span className="button-spinner" />Loading your appointments…</div> : upcoming.length ? (
            <div className="appointment-list">
              {upcoming.slice(0, 2).map((item) => <AppointmentCard key={item.id} item={item} personLabel="Doctor" onCancel={cancel} cancelBusy={actionId === item.id} />)}
            </div>
          ) : (
            <EmptyState icon="calendar" title="Nothing scheduled yet" description="Find a doctor and book an appointment when you’re ready." action={<button className="button button-primary" onClick={() => onNavigate('book')}>Browse availability<Icon name="arrow" size={16} /></button>} />
          )}
        </section>

        <section className="panel care-team-panel">
          <SectionTitle title="Care team" description="Doctors available to book." action={<span className="count-label">{doctors.length} listed</span>} />
          {loading ? <div className="loading-list"><span className="button-spinner" />Loading providers…</div> : doctors.length ? (
            <div className="provider-list">
              {doctors.slice(0, 4).map((item, index) => (
                <article className="provider-row" key={item.id}>
                  <span className={`provider-avatar provider-avatar-${index % 4}`}>{getInitials(item.name || 'DR')}</span>
                  <span className="provider-details"><strong>{item.name}</strong><small>{item.specialization || 'Care provider'}</small></span>
                  <button className="icon-button provider-book" onClick={() => { onNavigate('book'); loadSlots(String(item.id)) }} aria-label={`See availability for ${item.name}`} title="See availability"><Icon name="chevron" size={17} /></button>
                </article>
              ))}
              {doctors.length > 4 && <button className="text-button provider-more" onClick={() => onNavigate('book')}>See all {doctors.length} providers<Icon name="arrow" size={15} /></button>}
            </div>
          ) : (
            <EmptyState icon="users" title="No providers yet" description="When doctors are added to your care team, they’ll show up here." />
          )}
        </section>
      </div>
    </div>
  )
}

function DoctorDesk({ session, view, onNavigate, setError, setNotice }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [slotBusy, setSlotBusy] = useState(false)
  const [noteBusy, setNoteBusy] = useState(false)
  const [form, setForm] = useState(() => {
    const start = nextDayAtNine()
    return { startTime: toLocalInput(start), endTime: toLocalInput(new Date(start.getTime() + 30 * 60 * 1000)) }
  })
  const [note, setNote] = useState({ appointmentId: '', content: '' })

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setAppointments(await api.appointments() || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  const confirmed = sortedAppointments.filter((item) => item.status === 'CONFIRMED')
  const upcoming = sortedAppointments.filter((item) => item.status !== 'CANCELLED' && new Date(item.startTime) >= new Date())
  const notesCount = appointments.reduce((total, item) => total + (item.notes?.length || 0), 0)

  async function createSlot(event) {
    event.preventDefault()
    setError('')
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('The end time must be after the start time.')
      return
    }
    setSlotBusy(true)
    try {
      await api.createSlot({
        doctorId: session.doctorId,
        startTime: form.startTime.length === 16 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 16 ? `${form.endTime}:00` : form.endTime,
      })
      setNotice('Availability published')
      const nextStart = new Date(form.startTime)
      nextStart.setDate(nextStart.getDate() + 1)
      setForm({ startTime: toLocalInput(nextStart), endTime: toLocalInput(new Date(nextStart.getTime() + 30 * 60 * 1000)) })
    } catch (err) {
      setError(err.message)
    } finally {
      setSlotBusy(false)
    }
  }

  async function saveNote(event) {
    event.preventDefault()
    setError('')
    setNoteBusy(true)
    try {
      await api.addNote({ appointmentId: Number(note.appointmentId), content: note.content.trim() })
      setNotice('Clinical note saved')
      setNote({ appointmentId: '', content: '' })
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setNoteBusy(false)
    }
  }

  if (view === 'availability') {
    return (
      <div className="dashboard-columns doctor-layout">
        <section className="panel">
          <SectionTitle title="Publish availability" description="Add a time slot patients can book." />
          <form className="form-stack" onSubmit={createSlot}>
            <label className="field"><span>Starts</span><input type="datetime-local" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required /></label>
            <label className="field"><span>Ends</span><input type="datetime-local" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required /></label>
            <p className="form-hint"><Icon name="clock" size={15} /> Set the local start and end time for this appointment slot.</p>
            <button className="button button-primary" disabled={slotBusy}>{slotBusy ? <><span className="button-spinner" />Publishing…</> : <><Icon name="plus" size={17} />Publish time slot</>}</button>
          </form>
        </section>
        <section className="panel soft-panel">
          <div className="soft-icon"><Icon name="calendar" size={22} /></div>
          <h2>Make time for care</h2>
          <p>Published slots appear in the patient booking flow. You can add another time whenever your schedule changes.</p>
          <div className="soft-stat"><strong>{upcoming.length}</strong><span>upcoming appointments</span></div>
        </section>
      </div>
    )
  }

  if (view === 'notes') {
    return (
      <div className="dashboard-columns notes-layout">
        <section className="panel">
          <SectionTitle title="Add a clinical note" description="Notes can be added to confirmed appointments." />
          <form className="form-stack" onSubmit={saveNote}>
            <label className="field">
              <span>Appointment</span>
              <select value={note.appointmentId} onChange={(event) => setNote({ ...note, appointmentId: event.target.value })} required>
                <option value="">Choose a confirmed appointment</option>
                {confirmed.map((item) => <option key={item.id} value={item.id}>#{item.id} · {item.patientName} · {formatDate(item.startTime)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Clinical note</span>
              <textarea rows="5" placeholder="Add the clinical note for this appointment…" value={note.content} onChange={(event) => setNote({ ...note, content: event.target.value })} required />
            </label>
            {!confirmed.length && !loading && <p className="form-hint">There are no confirmed appointments ready for a note.</p>}
            <button className="button button-primary" disabled={noteBusy || !confirmed.length}>{noteBusy ? <><span className="button-spinner" />Saving…</> : <><Icon name="file" size={17} />Save clinical note</>}</button>
          </form>
        </section>
        <section className="panel">
          <SectionTitle title="Recent appointments" description="Your patient appointments and current status." />
          {loading ? <div className="loading-list"><span className="button-spinner" />Loading appointments…</div> : appointments.length ? (
            <div className="appointment-list">
              {sortedAppointments.slice(0, 6).map((item) => <AppointmentCard key={item.id} item={item} personLabel="Patient" />)}
            </div>
          ) : <EmptyState icon="calendar" title="No appointments yet" description="Patient bookings will appear here." />}
        </section>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard icon="calendar" label="Upcoming visits" value={loading ? '—' : upcoming.length} detail="On your schedule" tone="mint" />
        <StatCard icon="check" label="Confirmed" value={loading ? '—' : confirmed.length} detail="Ready for care" tone="blue" />
        <StatCard icon="file" label="Clinical notes" value={loading ? '—' : notesCount} detail="Added to appointments" tone="peach" />
      </div>
      <section className="panel">
        <SectionTitle title="Your appointments" description="Review your upcoming schedule and patient details." action={<button className="button button-secondary button-small" onClick={() => onNavigate('availability')}><Icon name="plus" size={16} />Add availability</button>} />
        {loading ? <div className="loading-list"><span className="button-spinner" />Loading your appointments…</div> : upcoming.length ? (
          <div className="appointment-list">
            {upcoming.map((item) => <AppointmentCard key={item.id} item={item} personLabel="Patient" />)}
          </div>
        ) : (
          <EmptyState icon="calendar" title="Your schedule is open" description="Publish availability so patients can book a visit with you." action={<button className="button button-primary" onClick={() => onNavigate('availability')}>Publish availability<Icon name="arrow" size={16} /></button>} />
        )}
      </section>
    </div>
  )
}

function AdminDesk({ view, onNavigate, setError, setNotice }) {
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [doctorBusy, setDoctorBusy] = useState(false)
  const [adminBusy, setAdminBusy] = useState(false)
  const [doctor, setDoctor] = useState({ name: '', email: '', specialization: '', password: '' })
  const [staff, setStaff] = useState({ email: '', password: '' })

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const [doctorList, patientList, appointmentList] = await Promise.all([
        api.doctors(),
        api.patients(),
        api.appointments(),
      ])
      setDoctors(doctorList || [])
      setPatients(patientList || [])
      setAppointments(appointmentList || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function createDoctor(event) {
    event.preventDefault()
    setError('')
    setDoctorBusy(true)
    try {
      await api.createDoctor(doctor)
      setNotice('Doctor account created')
      setDoctor({ name: '', email: '', specialization: '', password: '' })
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setDoctorBusy(false)
    }
  }

  async function createAdmin(event) {
    event.preventDefault()
    setError('')
    setAdminBusy(true)
    try {
      await api.createStaff({ ...staff, role: 'ADMIN' })
      setNotice('Administrator account created')
      setStaff({ email: '', password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setAdminBusy(false)
    }
  }

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))

  if (view === 'team') {
    return (
      <div className="page-stack">
        <div className="stats-grid stats-grid-compact">
          <StatCard icon="users" label="Doctors" value={loading ? '—' : doctors.length} detail="Care providers" tone="mint" />
          <StatCard icon="heart" label="Patients" value={loading ? '—' : patients.length} detail="Registered accounts" tone="blue" />
          <StatCard icon="shield" label="Care network" value={loading ? '—' : doctors.length + patients.length} detail="Doctors and patients" tone="peach" />
        </div>
        <div className="dashboard-columns admin-forms">
          <section className="panel">
            <SectionTitle title="Add a doctor" description="Create a doctor profile and sign-in account." />
            <form className="form-stack" onSubmit={createDoctor}>
              <label className="field"><span>Full name</span><input placeholder="Dr. Alex Morgan" value={doctor.name} onChange={(event) => setDoctor({ ...doctor, name: event.target.value })} required /></label>
              <label className="field"><span>Email address</span><input type="email" placeholder="doctor@clinic.com" value={doctor.email} onChange={(event) => setDoctor({ ...doctor, email: event.target.value })} required /></label>
              <label className="field"><span>Specialization</span><input placeholder="Cardiology" value={doctor.specialization} onChange={(event) => setDoctor({ ...doctor, specialization: event.target.value })} required /></label>
              <label className="field"><span>Temporary password</span><input type="password" autoComplete="new-password" placeholder="Create a password" value={doctor.password} onChange={(event) => setDoctor({ ...doctor, password: event.target.value })} required /></label>
              <button className="button button-primary" disabled={doctorBusy}>{doctorBusy ? <><span className="button-spinner" />Creating…</> : <><Icon name="plus" size={17} />Create doctor</>}</button>
            </form>
          </section>
          <div className="panel-stack">
            <section className="panel">
              <SectionTitle title="Add an administrator" description="Create another admin account." />
              <form className="form-stack" onSubmit={createAdmin}>
                <label className="field"><span>Email address</span><input type="email" placeholder="admin@clinic.com" value={staff.email} onChange={(event) => setStaff({ ...staff, email: event.target.value })} required /></label>
                <label className="field"><span>Temporary password</span><input type="password" autoComplete="new-password" placeholder="Create a password" value={staff.password} onChange={(event) => setStaff({ ...staff, password: event.target.value })} required /></label>
                <button className="button button-secondary" disabled={adminBusy}>{adminBusy ? <><span className="button-spinner" />Creating…</> : <><Icon name="plus" size={17} />Create administrator</>}</button>
              </form>
            </section>
            <section className="panel compact-panel">
              <SectionTitle title="Registered patients" action={<span className="count-label">{patients.length}</span>} />
              {loading ? <div className="loading-list"><span className="button-spinner" />Loading patients…</div> : patients.length ? (
                <div className="simple-list">
                  {patients.slice(0, 5).map((patient) => (
                    <div className="simple-list-row" key={patient.id}>
                      <span className="provider-avatar provider-avatar-1">{getInitials(patient.name || patient.email)}</span>
                      <span className="provider-details"><strong>{patient.name}</strong><small>{patient.email}</small></span>
                    </div>
                  ))}
                  {patients.length > 5 && <button className="text-button" onClick={() => onNavigate('appointments')}>View activity<Icon name="arrow" size={15} /></button>}
                </div>
              ) : <EmptyState icon="users" title="No patients yet" description="Registered patient accounts will appear here." />}
            </section>
          </div>
        </div>
        <section className="panel">
          <SectionTitle title="Care team" description="Doctors currently listed in MedVault." />
          {loading ? <div className="loading-list"><span className="button-spinner" />Loading care team…</div> : doctors.length ? (
            <div className="doctor-grid">
              {doctors.map((item, index) => (
                <article className="doctor-card" key={item.id}>
                  <span className={`provider-avatar provider-avatar-${index % 4}`}>{getInitials(item.name || 'DR')}</span>
                  <div><h3>{item.name}</h3><p>{item.specialization || 'Care provider'}</p><span>{item.email}</span></div>
                </article>
              ))}
            </div>
          ) : <EmptyState icon="users" title="No doctors added yet" description="Create a doctor account above to start building your care team." />}
        </section>
      </div>
    )
  }

  if (view === 'appointments') {
    return (
      <section className="panel">
        <SectionTitle title="Appointment activity" description="Recent appointments across the care network." action={<span className="count-label">{appointments.length} total</span>} />
        {loading ? <div className="loading-list"><span className="button-spinner" />Loading appointments…</div> : sortedAppointments.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Status</th></tr></thead>
              <tbody>
                {sortedAppointments.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.patientName || 'Patient'}</strong><small>Appointment #{item.id}</small></td>
                    <td>{item.doctorName || '—'}</td>
                    <td>{formatDate(item.startTime)}</td>
                    <td><StatusPill status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon="calendar" title="No appointments yet" description="New bookings will show up here." />}
      </section>
    )
  }

  return (
    <div className="page-stack">
      <section className="welcome-banner admin-banner">
        <div className="welcome-content">
          <span className="welcome-kicker"><Icon name="shield" size={15} /> ADMIN OVERVIEW</span>
          <h2>Care operations, at a glance.</h2>
          <p>Keep track of appointments, patients, and your care team from one workspace.</p>
          <button className="button button-light" onClick={() => onNavigate('team')}>Manage care team<Icon name="arrow" size={17} /></button>
        </div>
        <div className="welcome-art" aria-hidden="true"><div className="art-ring art-ring-one" /><div className="art-ring art-ring-two" /><span className="art-cross"><Icon name="users" size={58} /></span></div>
      </section>
      <div className="stats-grid">
        <StatCard icon="calendar" label="Appointments" value={loading ? '—' : appointments.length} detail="Across MedVault" tone="mint" />
        <StatCard icon="users" label="Doctors" value={loading ? '—' : doctors.length} detail="Care providers" tone="blue" />
        <StatCard icon="heart" label="Patients" value={loading ? '—' : patients.length} detail="Registered accounts" tone="peach" />
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <SectionTitle title="Recent appointments" description="Latest activity across the care network." action={<button className="text-button" onClick={() => onNavigate('appointments')}>View all<Icon name="arrow" size={15} /></button>} />
          {loading ? <div className="loading-list"><span className="button-spinner" />Loading activity…</div> : sortedAppointments.length ? (
            <div className="appointment-list">
              {sortedAppointments.slice(0, 5).map((item) => (
                <div className="admin-appointment-row" key={item.id}>
                  <span className="provider-avatar provider-avatar-2">{getInitials(item.patientName || 'PT')}</span>
                  <span className="provider-details"><strong>{item.patientName || 'Patient'} <small>with {item.doctorName || 'doctor'}</small></strong><small>{formatDate(item.startTime)}</small></span>
                  <StatusPill status={item.status} />
                </div>
              ))}
            </div>
          ) : <EmptyState icon="calendar" title="No activity yet" description="Appointments will appear here as patients book visits." />}
        </section>
        <section className="panel quick-actions">
          <SectionTitle title="Quick actions" description="Common admin tasks." />
          <button className="quick-action" onClick={() => onNavigate('team')}><span className="quick-action-icon"><Icon name="users" size={18} /></span><span><strong>Add a doctor</strong><small>Create a doctor account</small></span><Icon name="chevron" size={17} /></button>
          <button className="quick-action" onClick={() => onNavigate('appointments')}><span className="quick-action-icon quick-action-blue"><Icon name="calendar" size={18} /></span><span><strong>Review appointments</strong><small>View booking activity</small></span><Icon name="chevron" size={17} /></button>
          <button className="quick-action" onClick={() => onNavigate('team')}><span className="quick-action-icon quick-action-peach"><Icon name="heart" size={18} /></span><span><strong>View care team</strong><small>See doctors and patients</small></span><Icon name="chevron" size={17} /></button>
        </section>
      </div>
    </div>
  )
}
