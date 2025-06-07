import React, { useEffect, useState } from 'react';
import API from '../../services/api';    // your axios instance
import { Link } from 'react-router-dom';

export default function TrendingFeed({ kind = 'projects' }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    // hit the new /projects/trending/ or /papers/trending/ endpoint:
    API.get(`/${kind}/trending/`)
      .then(({ data }) => setItems(data))
      .catch(() => setError(`Could not load trending ${kind}`))
      .finally(() => setLoading(false));
  }, [kind]);

  if (loading) return <div className="bg-white p-6 rounded-lg shadow-lg">Loading…</div>;
  if (error)   return <div className="bg-white p-6 rounded-lg shadow-lg text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Trending {kind === 'projects' ? 'Projects' : 'Papers'}
      </h3>
      <ul>
        {items.map(it => {
          const id    = it.project_id ?? it.paper_id;
          const title = it.title;
          const desc  = it.description;
          const count = it.worker_count;
          return (
            <li key={id}
                className="border-b py-4 hover:bg-gray-50 rounded-lg transition-all duration-300">
              <Link
                to={`/${kind}/${id}`}
                className="flex justify-between items-start"
              >
                <div className="pr-3 max-w-[180px]">
                  <h4 className="font-semibold text-gray-800 truncate">{title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{desc}</p>
                </div>
                <span className="text-sm text-gray-500 shrink-0 ml-3">
                  Members: {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
