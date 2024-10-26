'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import { Brain, Search, Plus, X, Menu } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { projects } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { AnimatePresence, motion } from 'framer-motion';

// Utilizziamo il tipo Project dallo schema di Drizzle
type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  progress: number;
  created_at: string;  // Cambiato da createdAt a created_at per corrispondere al database
};

export default function ProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  async function fetchProjects() {
    if (user) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);  // Cambiato da userId a user_id

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data as Project[] || []);
      }
    }
  }

  const handleNewProject = async () => {
    if (!user || !newProjectTitle) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            title: newProjectTitle, 
            description: newProjectDescription,
            user_id: user.id,  // Cambiato da userId a user_id per corrispondere al nome della colonna
            progress: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Aggiorniamo lo stato locale aggiungendo il nuovo progetto
      if (data) {
        setProjects(prevProjects => [...prevProjects, data as Project]);
      }

      // Resettiamo il form
      setNewProjectTitle('');
      setNewProjectDescription('');
      setIsNewProjectDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans">
      <header className="sticky top-0 z-10 bg-[#111111] border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-[#00ffff]" />
              <span className="text-2xl font-bold">MindSpace</span>
            </Link>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="hover:text-[#00ffff] transition-colors">Home</Link>
                <Link href="/projects" className="hover:text-[#00ffff] transition-colors">Projects</Link>
              </nav>
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
              <div className="hidden md:block">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
          
          {/* Menu mobile */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                className="md:hidden absolute left-0 right-0 bg-[#111111] shadow-lg py-4 px-4 border-b border-[#2a2a2a]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col space-y-4">
                  <Link 
                    href="/" 
                    className="hover:text-[#00ffff] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/projects" 
                    className="hover:text-[#00ffff] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Projects
                  </Link>
                  <div className="pt-2 border-t border-[#2a2a2a]">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">Organize your projects</h1>
        <p className="text-xl text-center text-gray-400 mb-8">
          MindSpace helps teams plan, track, and manage projects with unparalleled clarity and efficiency.
        </p>
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl flex">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder-gray-500 pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <Button 
              className="bg-[#00ffff] hover:bg-[#00cccc] text-black font-semibold ml-4"
              onClick={() => setIsNewProjectDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className="bg-[#1a1a1a] rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl h-[200px] flex flex-col">
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold mb-2 text-white">{project.title}</h2>
                  <p className="text-gray-400 mb-4 flex-grow">{project.description}</p>
                  <div className="mt-auto">
                    <div className="flex items-center mb-2">
                      <Progress value={Number(project.progress) || 0} className="flex-grow mr-4" />
                      <span className="text-sm font-medium text-[#00ffff]">{Number(project.progress) || 0}%</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new project to your MindSpace.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="col-span-3 bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="col-span-3 bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNewProjectDialogOpen(false)} variant="outline" className="bg-[#2a2a2a] text-white border-[#3a3a3a] hover:bg-[#3a3a3a]">
              Cancel
            </Button>
            <Button onClick={handleNewProject} className="bg-[#00ffff] hover:bg-[#00cccc] text-black font-semibold">
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
