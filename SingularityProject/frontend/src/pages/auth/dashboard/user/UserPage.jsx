import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  // fetch current user
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get('/users/');
        setUsers(data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // only allow edits/deletes if:
  //  • I'm superuser → I can manage anyone
  //  • OR target is neither staff nor superuser
  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async userId => {
    if (!canManage(users.find(u => u.user_id === userId))) {
      return alert("You don't have permission to delete this account");
    }
    if (!window.confirm('Delete this user?')) return;
    await API.delete(`/users/${userId}/`);
    setUsers(users.filter(u => u.user_id !== userId));
  };

  const handleEdit = userId => {
    if (!canManage(users.find(u => u.user_id === userId))) {
      return alert("You don't have permission to edit this account");
    }
    navigate(`/dashboard/users/edit/${userId}`);
  };

  if (loading) return <div>Loading users...</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-danger">Manage Users</h1>
      <button className="btn btn-primary mb-3" onClick={() => navigate('/dashboard/users/new')}>
        Create New User
      </button>
      {users.length>0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th><th>Username</th><th>Email</th>
                <th>First Name</th><th>Last Name</th><th>Is Staff</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td>{u.is_staff ? 'Yes' : 'No'}</td>
                  <td>
                    {canManage(u) ? (
                      <>
                        <button className="btn btn-warning btn-sm me-1"
                                onClick={() => handleEdit(u.user_id)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(u.user_id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No users available</p>
      )}
    </div>
  );
}
