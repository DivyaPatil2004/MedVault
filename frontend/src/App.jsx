import { useEffect, useMemo, useState } from 'react'
import { api, clearSession, getSession, setSession } from './api'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function App() {
  const [session, setSessionState] = useState(getSession())
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function saveSession(next) {
    setSession(next)
    setSessionState(next)
  }

  function logout() {
    clearSession()
    setSessionState(null)
    setTab('login')
  }

  if (!session) {
    return (
      <div className="shell">
        <header className="hero">
          <p className="eyebrow">Hospital Management</p>
          <h1>MedVault</h1>
          <p>Book appointments, check doctor availability, and keep clinical notes in one place.</p>
        </header>
        <div className="card auth-card">
          <div className="tabs">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Sign in</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register as patient</button>
          </div>
          {tab === 'login' ? (
            <AuthForm
              mode="login"
              onSubmit={async (payload) => {
                const data = await api.login(payload)
                saveSession(data)
              }}
              onError={setError}
            />
          ) : (
            <AuthForm
              mode="register"
              onSubmit={async (payload) => {
                await api.register(payload)
                const data = await api.login({ email: payload.email, password: payload.password })
                saveSession(data)
              }}
              onError={setError}
            />
          )}
          {error && <p className="alert">{error}</p>}
          <p className="hint">Demo admin: admin@medvault.com / Admin@123</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <strong>MedVault</strong>
          <span className="muted">{session.email} · {session.role}</span>
        </div>
        <button className="ghost" onClick={logout}>Sign out</button>
      </header>
      {notice && <p className="notice">{notice}</p>}
      {error && <p className="alert">{error}</p>}
      {session.role === 'PATIENT' && (
        <PatientDesk session={session} setError={setError} setNotice={setNotice} />
      )}
      {session.role === 'DOCTOR' && (
        <DoctorDesk session={session} setError={setError} setNotice={setNotice} />
      )}
      {session.role === 'ADMIN' && (
        <AdminDesk setError={setError} setNotice={setNotice} />
      )}
    </div>
  )
}

function AuthForm({ mode, onSubmit, onError }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    onError('')
    try {
      await onSubmit(form)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      {mode === 'register' && (
        <label>
          Full name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
      )}
      <label>
        Email
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </label>
      <label>
        Password
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      </label>
      <button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
  )
}

function PatientDesk({ session, setError, setNotice }) {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [slots, setSlots] = useState([])
  const [history, setHistory] = useState(null)

  async function refresh() {
    setError('')
    try {
      const list = await api.doctors()
      setDoctors(list)
      if (session.patientId) {
        setHistory(await api.history(session.patientId))
      }
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { refresh() }, [])

  async function loadSlots(id) {
    setDoctorId(id)
    setError('')
    try {
      setSlots(id ? await api.availableSlots(id) : [])
    } catch (err) {
      setError(err.message)
    }
  }

  async function book(slotId) {
    setError('')
    try {
      await api.book({ slotId })
      setNotice('Appointment booked')
      await loadSlots(doctorId)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function cancel(id) {
    setError('')
    try {
      await api.cancel(id)
      setNotice('Appointment cancelled')
      await refresh()
      if (doctorId) await loadSlots(doctorId)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Doctor availability</h2>
        <label>
          Choose a doctor
          <select value={doctorId} onChange={(e) => loadSlots(e.target.value)}>
            <option value="">Select…</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} · {doctor.specialization}
              </option>
            ))}
          </select>
        </label>
        <ul className="list">
          {slots.map((slot) => (
            <li key={slot.id}>
              <div>
                <strong>{formatDate(slot.startTime)}</strong>
                <span className="muted"> to {formatDate(slot.endTime)}</span>
              </div>
              <button onClick={() => book(slot.id)}>Book</button>
            </li>
          ))}
          {doctorId && slots.length === 0 && <li className="muted">No open slots</li>}
        </ul>
      </section>
      <section className="card">
        <h2>My history & clinical notes</h2>
        {history?.appointments?.map((item) => (
          <article key={item.id} className="history-item">
            <div className="row">
              <div>
                <strong>{item.doctorName}</strong>
                <p className="muted">{formatDate(item.startTime)} · {item.status}</p>
              </div>
              {item.status !== 'CANCELLED' && (
                <button className="ghost" onClick={() => cancel(item.id)}>Cancel</button>
              )}
            </div>
            {item.notes?.length ? item.notes.map((note) => (
              <p key={note.id} className="note">{note.content}<span> — {note.authorEmail}</span></p>
            )) : <p className="muted">No clinical notes yet</p>}
          </article>
        ))}
        {!history?.appointments?.length && <p className="muted">No appointments yet</p>}
      </section>
    </div>
  )
}

function DoctorDesk({ session, setError, setNotice }) {
  const start = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setMinutes(0, 0, 0)
    return date
  }, [])
  const [form, setForm] = useState({
    startTime: toLocalInput(start),
    endTime: toLocalInput(new Date(start.getTime() + 30 * 60 * 1000)),
  })
  const [appointments, setAppointments] = useState([])
  const [note, setNote] = useState({ appointmentId: '', content: '' })

  async function refresh() {
    try {
      setAppointments(await api.appointments())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { refresh() }, [])

  async function createSlot(event) {
    event.preventDefault()
    setError('')
    try {
      await api.createSlot({
        doctorId: session.doctorId,
        startTime: form.startTime.length === 16 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 16 ? `${form.endTime}:00` : form.endTime,
      })
      setNotice('Availability slot created')
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveNote(event) {
    event.preventDefault()
    setError('')
    try {
      await api.addNote({ appointmentId: Number(note.appointmentId), content: note.content })
      setNotice('Clinical note saved')
      setNote({ appointmentId: '', content: '' })
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Publish availability</h2>
        <form className="stack" onSubmit={createSlot}>
          <label>
            Start
            <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
          </label>
          <label>
            End
            <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
          </label>
          <button>Create slot</button>
        </form>
      </section>
      <section className="card">
        <h2>Appointments & notes</h2>
        <form className="stack" onSubmit={saveNote}>
          <label>
            Appointment
            <select value={note.appointmentId} onChange={(e) => setNote({ ...note, appointmentId: e.target.value })} required>
              <option value="">Select…</option>
              {appointments.filter((item) => item.status === 'CONFIRMED').map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} {item.patientName} · {formatDate(item.startTime)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Clinical note
            <textarea value={note.content} onChange={(e) => setNote({ ...note, content: e.target.value })} required />
          </label>
          <button>Add note</button>
        </form>
        <ul className="list">
          {appointments.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.patientName}</strong>
                <p className="muted">{formatDate(item.startTime)} · {item.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function AdminDesk({ setError, setNotice }) {
  const [doctor, setDoctor] = useState({ name: '', email: '', specialization: '', password: '' })
  const [staff, setStaff] = useState({ email: '', password: '', role: 'ADMIN' })
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])

  async function refresh() {
    try {
      setPatients(await api.patients())
      setAppointments(await api.appointments())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { refresh() }, [])

  async function createDoctor(event) {
    event.preventDefault()
    setError('')
    try {
      await api.createDoctor(doctor)
      setNotice('Doctor account created')
      setDoctor({ name: '', email: '', specialization: '', password: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  async function createStaff(event) {
    event.preventDefault()
    setError('')
    try {
      await api.createStaff(staff)
      setNotice('Staff account created')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Create doctor</h2>
        <form className="stack" onSubmit={createDoctor}>
          <input placeholder="Name" value={doctor.name} onChange={(e) => setDoctor({ ...doctor, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={doctor.email} onChange={(e) => setDoctor({ ...doctor, email: e.target.value })} required />
          <input placeholder="Specialization" value={doctor.specialization} onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })} required />
          <input placeholder="Password" type="password" value={doctor.password} onChange={(e) => setDoctor({ ...doctor, password: e.target.value })} required />
          <button>Save doctor</button>
        </form>
      </section>
      <section className="card">
        <h2>Create admin</h2>
        <form className="stack" onSubmit={createStaff}>
          <input placeholder="Email" type="email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={staff.password} onChange={(e) => setStaff({ ...staff, password: e.target.value })} required />
          <button>Save admin</button>
        </form>
      </section>
      <section className="card wide">
        <h2>Patients</h2>
        <ul className="list">
          {patients.map((patient) => (
            <li key={patient.id}>{patient.name} · {patient.email}</li>
          ))}
        </ul>
        <h2>Appointments</h2>
        <ul className="list">
          {appointments.map((item) => (
            <li key={item.id}>
              {item.patientName} with {item.doctorName} · {formatDate(item.startTime)} · {item.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
