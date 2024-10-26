'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProjectDetailsProps {
  project: {
    id: string;
    title: string;
    description: string;
  };
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-primary mb-4">{project.title}</h1>
      <p className="text-text text-lg">{project.description}</p>
    </motion.div>
  );
};

export default ProjectDetails;
