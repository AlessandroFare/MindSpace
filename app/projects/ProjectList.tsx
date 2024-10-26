'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects: initialProjects }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProject = async () => {
    if (newProjectTitle.trim()) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newProjectTitle, description: newProjectDescription }),
        });

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        const newProject = await response.json();
        setProjects([...projects, newProject]);
        setNewProjectTitle('');
        setNewProjectDescription('');
        setIsDialogOpen(false);
        toast.success('Progetto creato con successo');
      } catch (error) {
        console.error('Error creating project:', error);
        toast.error('Errore durante la creazione del progetto');
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={`/projects/${project.id}`}>
              <Card className="h-full cursor-pointer bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">{project.title}</CardTitle>
                  <CardDescription className="text-text mt-2">{project.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mt-12 bg-secondary text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition-colors duration-300">
            Nuovo Progetto
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea nuovo progetto</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Titolo del progetto"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Descrizione del progetto"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleCreateProject}>Crea Progetto</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectList;
