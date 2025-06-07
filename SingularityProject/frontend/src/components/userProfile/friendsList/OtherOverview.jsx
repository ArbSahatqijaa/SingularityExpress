import React from 'react';
import ProjectsList from '../ProjectPaperTutorialList/ProjectsList';
import PaperList from '../ProjectPaperTutorialList/PaperList';      

const OtherOverview = ({ user }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Work Overview</h1>

      <section className="mb-8">
        <ProjectsList user={user} />
      </section>

      <section className="mb-8">
        <PaperList user={user} />
      </section>

      
    </div>
  );
};

export default OtherOverview;
