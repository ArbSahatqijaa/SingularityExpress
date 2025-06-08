import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function PaperPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data } = await API.get('/papers/');
        setPapers(data);
      } catch (err) {
        setError('Failed to load papers');
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleDelete = async paperId => {
    if (!window.confirm('Delete this paper?')) return;
    await API.delete(`/papers/${paperId}/`);
    setPapers(papers.filter(p => p.paper_id !== paperId));
  };

  const handleEdit = paperId => {
    navigate(`/dashboard/papers/edit/${paperId}`);
  };

  if (loading) return <div>Loading papers...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-danger">Manage Papers</h1>
      <button className="btn btn-primary mb-3" onClick={() => navigate('/dashboard/papers/new')}>
        Create New Paper
      </button>
      {papers.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
  <tr>
    <th>ID</th>
    <th>Title</th>
    <th>Description</th>
    <th>Status</th>
    <th>Visibility</th>
    <th>Accepting Applications</th> 
    <th>Role Details</th>           
    <th>File Path</th>
    <th>Created By</th>
    <th>Actions</th>
  </tr>
</thead>
            <tbody>
  {papers.map(p => (
    <tr key={p.paper_id}>
      <td>{p.paper_id}</td>
      <td>{p.title}</td>
      <td>{p.description}</td>
      <td>{p.status}</td>
      <td>{p.visibility}</td>
      <td>{p.accepting_applications ? 'Yes' : 'No'}</td> 
      <td>{p.role_details || '-'}</td>                    
      <td>{p.file_path}</td>
      <td>{p.created_by}</td>
      <td>
        <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(p.paper_id)}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.paper_id)}>
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      ) : (
        <p>No papers available</p>
      )}
    </div>
  );
}
