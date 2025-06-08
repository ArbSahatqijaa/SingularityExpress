import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../../../services/api'

export default function UserProjectForm() {
  const { userProjectId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    id: null,
    user_id: '',
    project_id: '',
    role: 'OBSERVER'
  })
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setForm(f => ({ ...f, user_id: data.user_id }))
        return Promise.all([API.get('/users/'), API.get('/projects/')])
      })
      .then(([uRes, pRes]) => {
        setUsers(uRes.data)
        setProjects(pRes.data)
      })
      .catch(() => setError('Failed to load users or projects'))
  }, [])

  useEffect(() => {
    if (!userProjectId) return
    setLoading(true)
    API.get(`/user_projects/${userProjectId}/`)
      .then(({ data }) => {
        setForm({
          id: data.id,
          user_id: data.user.user_id,
          project_id: data.project.project_id,
          role: data.role
        })
      })
      .catch(() => setError('Failed to load assignment'))
      .finally(() => setLoading(false))
  }, [userProjectId])

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = userProjectId
      ? { role: form.role }
      : {
          user_id: parseInt(form.user_id, 10),
          project_id: parseInt(form.project_id, 10),
          role: form.role
        }

    try {
      if (userProjectId) {
        await API.patch(`/user_projects/${form.id}/`, payload)
      } else {
        await API.post('/user_projects/', payload)
      }
      navigate('/dashboard/user_projects')
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data))
    } finally {
      setLoading(false)
    }
  }

  if (loading && userProjectId) return <div className="text-center py-5">Loading…</div>

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">
          {userProjectId ? 'Edit Project Assignment' : 'New Project Assignment'}
        </h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {form.id != null && (
                <div className="mb-4">
                  <label className="form-label">Assignment ID</label>
                  <input type="text" className="form-control" value={form.id} readOnly />
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
                  disabled={Boolean(userProjectId)}
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
                <label className="form-label">Project</label>
                <select
                  name="project_id"
                  className="form-select"
                  value={form.project_id}
                  onChange={handleChange}
                  required
                  disabled={Boolean(userProjectId)}
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
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
                  {userProjectId ? 'Save Changes' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/user_projects')}
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
