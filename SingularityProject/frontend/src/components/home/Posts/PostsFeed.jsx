// src/components/Posts/PostsFeed.jsx
import React, { useEffect, useState, Fragment } from "react";
import API from "../../../services/api";

import ProjectCard       from "../../projectCard/projectCard";
import ResearchPaperCard from "../ResearchPaper/ResearchPaperCard";

/* ---------- helpers ---------- */
const toMs  = o => Date.parse(o.created_at || o.updated_at || 0) || 0;
const numId = o => o.project_id ?? o.paper_id ?? o.tutorial_id ?? 0;
const url   = (p, base) => (p?.startsWith("http") ? p : base + p);

export default function PostsFeed({ meId }) {
  const [posts,   setPosts]   = useState([]);
  const [display, setDisplay] = useState([]);
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  /* ---------- initial fetch ---------- */
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

  /* ---------- recompute display on query change ---------- */
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setDisplay(posts); return; }

    const words = q.split(/\s+/);              // every word must match

    const score = title => {
      const t = (title || "").toLowerCase();
      if (words.some(w => !t.includes(w))) return Infinity;
      if (t.startsWith(words[0])) return -1;   // best
      return t.indexOf(words[0]);              // earlier is better
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

  /* ---------- early states ---------- */
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

  /* ---------- main UI ---------- */
  return (
    <>
      {SearchBox}
      {display.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map(item => (
            <RenderCard key={numId(item)} item={item} meId={meId} />
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- card wrapper ---------- */
const BadgeFrame = ({ label, color, children }) => (
  <div>
    <div className="flex justify-end mb-1">
      <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-${color}-100 text-${color}-800`}>
        {label}
      </span>
    </div>
    {children}
  </div>
);

/* ---------- per-item renderer ---------- */
function RenderCard({ item, meId }) {
  const base = API.defaults.baseURL;

  switch (item.__type) {
    case "project": {
      const leader =
        item.leader_full_name || item.leader_username ||
        item.leader?.full_name || item.leader?.username ||
        `User #${item.leader}`;

      return (
        <BadgeFrame label="Project" color="blue">
          <ProjectCard
            {...item}
            image={item.image      ? url(item.image, base)      : null}
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
        <BadgeFrame label="Paper" color="green">
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
          <div className="bg-white p-4 rounded-xl shadow border hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-purple-600">📖</span> {item.title}
            </h3>
            {item.file_path ? (
              <div className="flex justify-end">
                <a
                  href={url(item.file_path, base)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                >
                  Download
                </a>
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">No file</p>
            )}
          </div>
        </BadgeFrame>
      );

    default:
      return null;
  }
}
