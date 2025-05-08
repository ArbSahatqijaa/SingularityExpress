import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../../../services/api'

export default function UserPaperForm() {
  const { userPaperId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    id:       null,
    user_id:  '',
    paper_id: '',
    role:     'VIEWER'
  })
  const [users,  setUsers]  = useState([])
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // load current user and all users + papers
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setForm(f => ({ ...f, user_id: data.user_id }))
        return Promise.all([
          API.get('/users/'),
          API.get('/papers/')
        ])
      })
      .then(([uRes, pRes]) => {
        setUsers(uRes.data)
        setPapers(pRes.data)
      })
      .catch(() => {
        setError('Failed to load users or papers')
      })
  }, [])

  // if we're editing, fetch that assignment
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
      .catch(() => {
        setError('Failed to load assignment')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userPaperId])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
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

  if (loading && userPaperId) {
    return <div className="text-center py-5">Loading…</div>
  }

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">
          {userPaperId ? 'Edit Assignment' : 'New Assignment'}
        </h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>

              {form.id != null && (
                <div className="mb-4">
                  <label className="form-label">Assignment ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.id}
                    readOnly
                  />
                </div>
              )}

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

              <div className="mb-4">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="AUTHOR">Author</option>
                  <option value="CO_AUTHOR">Co-Author</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
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
