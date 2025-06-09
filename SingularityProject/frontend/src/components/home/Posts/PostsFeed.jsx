// src/components/Posts/PostsFeed.jsx
import React, { useEffect, useState, Fragment } from "react";
import API from "../../../services/api";

import ProjectCard       from "../../projectCard/projectCard";
import ResearchPaperCard from "../ResearchPaper/ResearchPaperCard";

/* ---------- helpers ---------- */
const toMs  = o => Date.parse(o.created_at || o.updated_at || 0) || 0;
const numId = o => o.project_id ?? o.paper_id ?? o.tutorial_id ?? 0;
const url   = (p, base) => (p?.startsWith("http") ? p : base + p);

const defaultProjectImage = "/default_images/default-project.svg";

export default function PostsFeed({ meId }) {
  const [posts,   setPosts]   = useState([]);
  const [display, setDisplay] = useState([]);
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [proj, pap, tut] = await Promise.all([
          API.get("/projects/"),
          API.get("/papers/"),
          API.get("/tutorials/"),
        ]);
        const tag = (a, t) => a.map(o => ({ ...o, __type: t }));
        const merged = [
          ...tag(proj.data, "project"),
          ...tag(pap.data,  "paper"),
          ...tag(tut.data,  "tutorial"),
        ].sort((a, b) => (toMs(b) - toMs(a)) || (numId(b) - numId(a)));

        setPosts(merged);
        setDisplay(merged);
      } catch { setError("Failed to load posts"); }
      finally  { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setDisplay(posts); return; }

    const words = q.split(/\s+/);

    const score = title => {
      const t = (title || "").toLowerCase();
      if (words.some(w => !t.includes(w))) return Infinity;
      if (t.startsWith(words[0])) return -1;
      return t.indexOf(words[0]);
    };

    setDisplay(
      posts
        .filter(p => score(p.title) !== Infinity)
        .sort((a, b) => {
          const diff = score(a.title) - score(b.title);
          return diff !== 0 ? diff : numId(b) - numId(a);
        })
    );
  }, [query, posts]);

  const SearchBox = (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search titles…"
      className="w-full border p-2 rounded mb-4"
    />
  );

  if (loading) {
    return (
      <Fragment>
        {SearchBox}
        <p>Loading posts…</p>
      </Fragment>
    );
  }

  if (error) {
    return (
      <Fragment>
        {SearchBox}
        <p className="text-red-500">{error}</p>
      </Fragment>
    );
  }

  return (
    <>
      {SearchBox}
      {display.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {display.map(item => (
            <div key={numId(item)} className="w-full max-w-5xl mx-auto">
              <RenderCard item={item} meId={meId} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const BadgeFrame = ({ label, color, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex justify-between items-center mb-4">
      <h4 className={`text-sm font-semibold text-${color}-700 bg-${color}-100 px-3 py-1 rounded-full`}>{label}</h4>
    </div>
    {children}
  </div>
);

function RenderCard({ item, meId }) {
  const base = API.defaults.baseURL;

  switch (item.__type) {
    case "project": {
      const leader =
        item.leader_name ||
        `User #${item.leader}`;

      return (
        <BadgeFrame label="Project" color="blue">
          <ProjectCard
            {...item}
            image={item.image ? url(item.image, base) : defaultProjectImage}
            fileUrl={item.file_path? url(item.file_path, base)  : null}
            leaderName={leader}
            leaderId={Number(item.leader)}
            createdById={item.created_by}
            meId={meId}
          />
        </BadgeFrame>
      );
    }

    case "paper":
      return (
        <BadgeFrame label="Research" color="green">
          <ResearchPaperCard
            {...item}
            file_path={item.file_path ? url(item.file_path, base) : null}
            meId={meId}
          />
        </BadgeFrame>
      );

    case "tutorial":
      return (
        <BadgeFrame label="Tutorial" color="purple">
          <div className="text-sm text-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
            {item.file_path ? (
              <div className="flex justify-end">
                <a
                  href={url(item.file_path, base)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Download
                </a>
              </div>
            ) : (
              <p className="text-gray-400 italic">No file available</p>
            )}
          </div>
        </BadgeFrame>
      );

    default:
      return null;
  }
}
