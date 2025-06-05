import React from 'react';
import ProjectsList from './ProjectsList';
import PaperList from './PaperList';      
import TutorialList from './TutorialList';

const Overview = ({ user }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Work Overview</h1>

      <section className="mb-8">
        <ProjectsList user={user} />
      </section>

      <section className="mb-8">
        <PaperList user={user} />
      </section>

      <section className="mb-8">
        <TutorialList user={user} />
      </section>
    </div>
  );
};

export default Overview;
