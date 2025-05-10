import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../../../services/api'

export default function PaperProjectForm() {
  const { paperProjectId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    id: null,
    paper_id: '',
    project_id: '',
    notes: '',
    added_by: '',
  })

  const [papers, setPapers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load user + data
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setForm(f => ({ ...f, added_by: data.user_id }))
        return Promise.all([API.get('/papers/'), API.get('/projects/')])
      })
      .then(([pRes, projRes]) => {
        setPapers(pRes.data)
        setProjects(projRes.data)
      })
      .catch(() => setError('Failed to load papers or projects'))
  }, [])

  // Load existing record
  useEffect(() => {
    if (!paperProjectId) return
    setLoading(true)
    API.get(`/paper_projects/${paperProjectId}/`)
      .then(({ data }) => {
        setForm({
          id: data.id,
          paper_id: data.paper.paper_id,
          project_id: data.project.project_id,
          notes: data.notes || '',
          added_by: data.added_by,
        })
      })
      .catch(() => setError('Failed to load record'))
      .finally(() => setLoading(false))
  }, [paperProjectId])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

 const handleSubmit = async e => {
  e.preventDefault()
  setError('')
  setLoading(true)

  const payload = {
    paper_id:  parseInt(form.paper_id, 10),
    project_id: parseInt(form.project_id, 10),
    notes: form.notes,
    added_by: form.added_by,
  }

  try {
    if (paperProjectId) {
      await API.patch(`/paper_projects/${form.id}/`, payload) 
    } else {
      await API.post('/paper_projects/', payload)
    }
    navigate('/dashboard/paper_projects')
  } catch (err) {
    setError('Save failed: ' + JSON.stringify(err.response?.data))
  } finally {
    setLoading(false)
  }
}

  if (loading && paperProjectId) {
    return <div className="text-center py-5">Loading…</div>
  }

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">
          {paperProjectId ? 'Edit Link' : 'New Paper-Project Link'}
        </h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {form.id != null && (
                <div className="mb-4">
                  <label className="form-label">ID</label>
                  <input className="form-control" value={form.id} readOnly />
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">Paper</label>
                <select
                  name="paper_id"
                  className="form-select"
                  value={form.paper_id}
                  onChange={handleChange}
                  required
                  disabled={Boolean(paperProjectId)}
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
                <label className="form-label">Project</label>
                <select
                  name="project_id"
                  className="form-select"
                  value={form.project_id}
                  onChange={handleChange}
                  required
                  disabled={Boolean(paperProjectId)}
                >
                  <option value="">Select Project</option>
                  {projects.map(proj => (
                    <option key={proj.project_id} value={proj.project_id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  name="notes"
                  className="form-control"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {paperProjectId ? 'Save Changes' : 'Create Link'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/paper_projects')}
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