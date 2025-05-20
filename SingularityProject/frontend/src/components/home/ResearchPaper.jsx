import React, { useState, useEffect } from 'react';
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentDots,
  FaBookmark,
  FaRegBookmark,
  FaDownload,
} from 'react-icons/fa';
import JoinTeamModal from './JoinTeamModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ResearchProjects = () => {
  const [likedProjects, setLikedProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [comments, setComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [viewResearchProject, setViewResearchProject] = useState(null);
  const [joinTeamProject, setJoinTeamProject] = useState(null);

  const projects = [
    {
      id: 201,
      title: "Quantum Computing for Optimization Problems",
      description:
        "Exploring the potential of quantum algorithms to solve complex optimization challenges more efficiently than classical methods.",
      fullDescription:
        `This research delves into the applications of quantum computing in solving large-scale optimization problems across various industries such as logistics, finance, and machine learning. We analyze quantum annealing and variational algorithms to improve speed and accuracy over classical techniques, aiming for breakthroughs in computational efficiency.`,
      pdfUrl: '/pdfs/quantum-computing-optimization.pdf', 
      teams: 1,
      maxTeams: 3,
      imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb",
      teamMembers: [
        'https://randomuser.me/api/portraits/men/40.jpg',
        'https://randomuser.me/api/portraits/women/45.jpg',
      ],
    },
    {
      id: 202,
      title: "Advancements in Renewable Energy Storage",
      description:
        "Investigating novel battery technologies and storage systems to enhance the efficiency and sustainability of renewable energy grids.",
      fullDescription:
        `This project focuses on developing cutting-edge energy storage solutions to address intermittency in renewable energy sources like solar and wind. Our work includes the design of advanced solid-state batteries and hybrid storage architectures, aiming to reduce costs and environmental impact while increasing storage capacity and lifecycle.`,
      pdfUrl: '/pdfs/renewable-energy-storage.pdf',
      teams: 2,
      maxTeams: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      teamMembers: [
        'https://randomuser.me/api/portraits/women/30.jpg',
        'https://randomuser.me/api/portraits/men/31.jpg',
        'https://randomuser.me/api/portraits/women/29.jpg',
      ],
    },
  ];

  const toggleLike = (id) => {
    setLikedProjects(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const toggleSave = (id) => {
    setSavedProjects(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const toggleCommentBox = (id) => {
    setShowCommentBox(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = (projectId, text) => {
    if (!text.trim()) return;
    setComments(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), text.trim()],
    }));
    setShowCommentBox(prev => ({ ...prev, [projectId]: false }));
  };

  const truncate = (text, length = 120) =>
    text.length > length ? text.slice(0, length) + '…' : text;

  useEffect(() => {
    document.body.style.overflow = viewResearchProject ? 'hidden' : 'auto';
  }, [viewResearchProject]);

  // Function to generate and download PDF of full research
  const downloadPDF = async (project) => {
  const pdfContent = document.createElement('div');
  pdfContent.style.width = '800px';
  pdfContent.style.padding = '20px';
  pdfContent.style.fontFamily = 'Arial';
  pdfContent.style.backgroundColor = 'white';
  pdfContent.style.color = '#000';
  pdfContent.style.position = 'absolute';
  pdfContent.style.top = '-9999px'; 
  pdfContent.innerHTML = `
    <h1 style="font-size:28px; font-weight:bold; margin-bottom:20px;">${project.title}</h1>
    <div style="margin-bottom:20px;">
      ${project.teamMembers
        .map(
          (_, i) =>
            `<div style="display:inline-block; margin-right:15px; text-align:center;">
              <div style="width:40px; height:40px; border-radius:50%; border:1px solid #ccc; margin-bottom:5px; background-image: url('${project.teamMembers[i]}'); background-size: cover; background-position:center;"></div>
              <div style="font-size:12px;">Author ${i + 1}</div>
            </div>`
        )
        .join('')}
    </div>
    <h2 style="font-size:22px; font-weight:600; border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px;">Abstract</h2>
    <p style="font-style:italic; margin-bottom:20px;">${project.description}</p>
    <h2 style="font-size:22px; font-weight:600; border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px;">Introduction</h2>
    <p style="margin-bottom:20px;">${project.fullDescription
      .split('\n\n')
      .slice(0, 2)
      .join('\n\n')}</p>
    <h2 style="font-size:22px; font-weight:600; border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px;">Main Content</h2>
    <p style="margin-bottom:20px;">${project.fullDescription
      .split('\n\n')
      .slice(2)
      .join('\n\n')}</p>
    <h2 style="font-size:22px; font-weight:600; border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px;">References</h2>
    <ol style="font-size:14px; padding-left:20px; margin-bottom:0;">
      <li>Author A., "Quantum Algorithms and Optimization," Journal of Computing, 2023.</li>
      <li>Author B., "Renewable Energy Storage Systems," Energy Science Review, 2024.</li>
      <li>Author C., "Advances in Battery Technologies," Tech Innovations, 2022.</li>
    </ol>
  `;

  document.body.appendChild(pdfContent);

  const canvas = await html2canvas(pdfContent, {
    scale: 2,
    useCORS: true,
  });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${project.title.replace(/\s+/g, '_')}.pdf`);

  document.body.removeChild(pdfContent);
};

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-gray-100 min-h-screen">
      <div className="space-y-8">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-transform hover:shadow-xl"
            style={{ minHeight: 'auto' }}
          >
            <div className="w-full h-48 relative overflow-hidden flex-shrink-0">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="object-cover w-full h-full"
                loading="lazy"
                draggable={false}
              />
              {project.teams < project.maxTeams ? (
                <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-lg select-none">
                  Open
                </span>
              ) : (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-lg select-none">
                  Full
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col">
              <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                <h2 className="text-2xl font-semibold text-gray-900">{project.title}</h2>
                <div className="mt-1 md:mt-0 text-gray-600 font-medium text-sm">
                  Teams: {project.teams} / {project.maxTeams}
                </div>
              </header>

              <p
                className="text-gray-700 text-base mb-5 flex-grow overflow-hidden"
                style={{
                  maxHeight: '3.5rem',
                  lineClamp: 2,
                  WebkitLineClamp: 2,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {truncate(project.description, 160)}
              </p>

              {/* Team members */}
              <div className="flex items-center mb-5 -space-x-3">
                {project.teamMembers.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt={`Team member ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    loading="lazy"
                    draggable={false}
                  />
                ))}
              </div>

              {/* Actions Icons */}
              <div className="flex space-x-7 text-gray-600 text-lg mb-4">
                <button
                  onClick={() => toggleLike(project.id)}
                  className={`hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded ${
                    likedProjects.includes(project.id) ? 'text-red-600' : ''
                  }`}
                  aria-label="Like project"
                  title="Like project"
                  type="button"
                >
                  {likedProjects.includes(project.id) ? <FaHeart /> : <FaRegHeart />}
                </button>

                <button
                  onClick={() => toggleCommentBox(project.id)}
                  className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Comment"
                  title="Add comment"
                  type="button"
                >
                  <FaRegCommentDots />
                </button>

                <button
                  onClick={() => toggleSave(project.id)}
                  className={`hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded ${
                    savedProjects.includes(project.id) ? 'text-yellow-500' : ''
                  }`}
                  aria-label="Save project"
                  title="Save project"
                  type="button"
                >
                  {savedProjects.includes(project.id) ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setViewResearchProject(project)}
                  className="flex-grow bg-blue-600 text-white px-5 py-2 rounded-md font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="button"
                >
                  View Research
                </button>

                {project.teams < project.maxTeams && (
                  <button
                    onClick={() => setJoinTeamProject(project)}
                    className="flex-grow bg-green-600 text-white px-5 py-2 rounded-md font-semibold shadow hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="button"
                  >
                    Join Team
                  </button>
                )}
              </div>

              {/* Comment box */}
              {showCommentBox[project.id] && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const comment = e.target.elements.comment.value;
                    handleCommentSubmit(project.id, comment);
                    e.target.reset();
                  }}
                  className="flex flex-col mb-4"
                >
                  <textarea
                    id={`comment-${project.id}`}
                    name="comment"
                    rows={3}
                    placeholder="Write your comment..."
                    className="resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900"
                    maxLength={300}
                    required
                    aria-label="Write your comment"
                  />
                  <button
                    type="submit"
                    className="self-end mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Submit
                  </button>
                </form>
              )}

              {/* Show comments */}
              {comments[project.id] && comments[project.id].length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2 border border-gray-200 rounded">
                  {comments[project.id].map((comment, index) => (
                    <p
                      key={index}
                      className="text-gray-800 text-sm border-b border-gray-300 last:border-none pb-1"
                    >
                      {comment}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Modal for viewing research */}
    {viewResearchProject && (
  <div
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6"
    role="dialog"
    aria-modal="true"
    aria-labelledby="research-modal-title"
    aria-describedby="research-modal-desc"
    tabIndex={-1}
    onClick={() => setViewResearchProject(null)}
  >
    <div
      className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-10 relative font-serif text-gray-900"
      onClick={(e) => e.stopPropagation()}
      style={{ lineHeight: '1.6', fontSize: '16px' }}
    >
      {/* Title */}
      <h1
        id="research-modal-title"
        className="text-4xl font-bold mb-6 tracking-tight"
      >
        {viewResearchProject.title}
      </h1>

      {/* Authors */}
      <div className="flex items-center space-x-3 mb-6">
        {viewResearchProject.teamMembers.map((avatar, i) => (
          <div key={i} className="flex items-center space-x-2">
            <img
              src={avatar}
              alt={`Author ${i + 1}`}
              className="w-10 h-10 rounded-full border border-gray-300"
              loading="lazy"
              draggable={false}
            />
            <span className="text-sm text-gray-700">Author {i + 1}</span>
          </div>
        ))}
      </div>

      {/* Abstract */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 border-b border-gray-300 pb-1">
          Abstract
        </h2>
        <p className="text-gray-800 italic">{viewResearchProject.description}</p>
      </section>

      {/* Introduction */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 border-b border-gray-300 pb-1">
          Introduction
        </h2>
        <p>
          {viewResearchProject.fullDescription
            .split('\n\n')
            .slice(0, 2)
            .map((para, idx) => (
              <span key={idx}>
                {para}
                <br />
                <br />
              </span>
            ))}
        </p>
      </section>

      {/* Main Content */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 border-b border-gray-300 pb-1">
          Main Content
        </h2>
        <p>
          {viewResearchProject.fullDescription
            .split('\n\n')
            .slice(2)
            .map((para, idx) => (
              <span key={idx}>
                {para}
                <br />
                <br />
              </span>
            ))}
        </p>
      </section>

      {/* References */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-gray-300 pb-1">
          References
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-1 text-sm">
          <li>Author A., "Quantum Algorithms and Optimization," Journal of Computing, 2023.</li>
          <li>Author B., "Renewable Energy Storage Systems," Energy Science Review, 2024.</li>
          <li>Author C., "Advances in Battery Technologies," Tech Innovations, 2022.</li>
        </ol>
      </section>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-10">
        <button
          onClick={() => downloadPDF(viewResearchProject)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="button"
        >
          <FaDownload />
          <span>Download PDF</span>
        </button>
        <button
          onClick={() => setViewResearchProject(null)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-5 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


      {/* Join team modal */}
      {joinTeamProject && (
        <JoinTeamModal
          project={joinTeamProject}
          onClose={() => setJoinTeamProject(null)}
        />
      )}
    </div>
  );
};

export default ResearchProjects;
