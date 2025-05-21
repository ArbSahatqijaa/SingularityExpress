import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout'; 
import DataTable from '../DashboardTable';  

export default function FriendshipPage() {
  const [friendships, setFriendships] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // load current user
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all friendships
  useEffect(() => {
    const fetchFriendships = async () => {
      try {
        const { data } = await API.get('/friendships/');
        setFriendships(data);
      } catch {
        setError('Failed to load friendships');
      } finally {
        setLoading(false);
      }
    };
    fetchFriendships();
  }, []);

  // allow superuser, staff, or participants to manage
  const canManage = f =>
    me?.is_superuser ||
    me?.is_staff ||
    me?.user_id === f.from_user.user_id ||
    me?.user_id === f.to_user_details.user_id;


  const handleDelete = async id => {
    const friendship = friendships.find(f => f.id === id);
    if (!canManage(friendship)) {
      return alert("You don't have permission to delete this friendship");
    }
    if (!window.confirm('Delete this friendship?')) return;
    await API.delete(`/friendships/${id}/`);
    setFriendships(friendships.filter(f => f.id !== id));
  };

  const handleEdit = id => {
    const friendship = friendships.find(f => f.id === id);
    if (!canManage(friendship)) {
      return alert("You don't have permission to edit this friendship");
    }
    navigate(`/dashboard/friendships/edit/${id}`);
  };

  if (loading) return <div>Loading friendships...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <DashboardLayout>
     <DataTable
  title="Manage Friendships"
  onCreate={() => navigate('/dashboard/friendships/new')}
  data={friendships}
  columns={[
    { header: 'ID', accessor: 'id' },
    { header: 'From User', accessor: row => row.from_user.username },
    { header: 'To User', accessor: row => row.to_user_details.username },
    {
      header: 'Status',
      accessor: row => (
        <span
          className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
            row.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
            row.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
            row.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-600'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: 'Created At',
      accessor: row => new Date(row.created_at).toLocaleString()
    },
    {
      header: 'Updated At',
      accessor: row => new Date(row.updated_at).toLocaleString()
    },
    {
      header: 'Responded At',
      accessor: row =>
        row.responded_at
          ? new Date(row.responded_at).toLocaleString()
          : <span className="text-gray-400">–</span>
    }
  ]}
  renderActions={(f) =>
    canManage(f) ? (
      <>
        <button
          onClick={() => handleEdit(f.id)}
          className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md text-xs font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(f.id)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium"
        >
          Delete
        </button>
      </>
    ) : (
      <span className="text-gray-400 text-sm">–</span>
    )
  }
    />

    </DashboardLayout>
  );
}
