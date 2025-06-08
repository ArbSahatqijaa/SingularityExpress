// src/pages/auth/dashboard/user_paper/UserPaperForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../../../services/api'

export default function UserPaperForm() {
  // route pattern is .../edit/:userPaperId
  const { userPaperId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    id: null,
    user_id: '',
    paper_id: '',
    role: 'VIEWER'
  })
  const [users,  setUsers]  = useState([])
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  /* ────────────────────────────────  Load lists  ───────────────────────────── */
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setForm(f => ({ ...f, user_id: data.user_id }))
        return Promise.all([API.get('/users/'), API.get('/papers/')])
      })
      .then(([uRes, pRes]) => {
        setUsers(uRes.data)
        setPapers(pRes.data)
      })
      .catch(() => setError('Failed to load users or papers'))
  }, [])

  /* ───────────────────────────────  Load record  ───────────────────────────── */
  useEffect(() => {
    if (!userPaperId) return
    setLoading(true)
    API.get(`/user_papers/${userPaperId}/`)
      .then(({ data }) => {
        setForm({
          id:       data.id,
          user_id:  data.user.user_id,
          paper_id: data.paper.paper_id,
          role:     data.role
        })
      })
      .catch(() => setError('Failed to load assignment'))
      .finally(() => setLoading(false))
  }, [userPaperId])

  /* ───────────────────────────────  Handlers  ──────────────────────────────── */
  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // On edit we only send role; on create we send everything
    const payload = userPaperId
      ? { role: form.role }
      : {
          user_id:  parseInt(form.user_id,  10),
          paper_id: parseInt(form.paper_id, 10),
          role:     form.role
        }

    try {
      if (userPaperId) {
        await API.patch(`/user_papers/${form.id}/`, payload)
      } else {
        await API.post('/user_papers/', payload)
      }
      navigate('/dashboard/user_papers')
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data))
    } finally {
      setLoading(false)
    }
  }

  if (loading && userPaperId) return <div className="text-center py-5">Loading…</div>

  /* ───────────────────────────────  Render  ────────────────────────────────── */
  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">
          {userPaperId ? 'Edit Paper Assignment' : 'New Paper Assignment'}
        </h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {form.id != null && (
                <div className="mb-4">
                  <label className="form-label">Assignment ID</label>
                  <input className="form-control" value={form.id} readOnly />
                </div>
              )}

              {/* ─────────────── User select ─────────────── */}
              <div className="mb-4">
                <label className="form-label">User</label>
                <select
                  name="user_id"
                  className="form-select"
                  value={form.user_id}
                  onChange={handleChange}
                  required
                  disabled={Boolean(userPaperId)}
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* ─────────────── Paper select ────────────── */}
              <div className="mb-4">
                <label className="form-label">Paper</label>
                <select
                  name="paper_id"
                  className="form-select"
                  value={form.paper_id}
                  onChange={handleChange}
                  required
                  disabled={Boolean(userPaperId)}
                >
                  <option value="">Select Paper</option>
                  {papers.map(p => (
                    <option key={p.paper_id} value={p.paper_id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* ─────────────── Role select ─────────────── */}
              <div className="mb-4">
                <label className="form-label">Role</label>
                <textarea
                  name="role"
                  rows="3"
                  required
                  className="form-control"
                  value={form.role}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {userPaperId ? 'Save Changes' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/user_papers')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
