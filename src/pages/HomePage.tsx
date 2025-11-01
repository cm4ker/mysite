import React from 'react';
import Microblog from '../components/microblog/Microblog';
import Timeline from '../components/timeline/Timeline';
import Skills from '../components/skills/Skills';
import Contact from '../components/contact/Contact';

const HomePage: React.FC = () => {
  return (
    <>
      <Microblog />
      <Timeline />
      <Skills />
      <Contact />
    </>
  );
};

export default HomePage;
