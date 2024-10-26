'use client'

import { useState } from 'react'
import { Brain, Plus, Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Project {
  id: number;
  title: string;
  description: string;
  progress: number;
}

const initialProjects: Project[] = [
  { id: 1, title: "Brand Redesign", description: "Revamping the company's visual identity", progress: 75 },
  { id: 2, title: "Mobile App UI", description: "Designing user interface for new mobile app", progress: 40 },
  { id: 3, title: "Marketing Campaign", description: "Planning and executing Q4 marketing strategy", progress: 60 },
  { id: 4, title: "Website Overhaul", description: "Rebuilding the company website from scratch", progress: 25 },
  { id: 5, title: "Product Launch", description: "Preparing for the launch of our new product line", progress: 90 },
  { id: 6, title: "Team Workshop", description: "Organizing a creative workshop for the design team", progress: 10 },
]

export function ProjectsPageComponent() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleNewProject = () => {
    if (newProjectTitle && newProjectDescription) {
      const newProject: Project = {
        id: projects.length + 1,
        title: newProjectTitle,
        description: newProjectDescription,
        progress: 0
      }
      setProjects([...projects, newProject])
      setNewProjectTitle('')
      setNewProjectDescription('')
      setIsNewProjectDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans">
      <header className="sticky top-0 z-10 bg-[#111111] border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-[#00ffff]" />
            <span className="text-2xl font-bold">MindSpace</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-[#00ffff] transition-colors">Features</a>
            <a href="#" className="hover:text-[#00ffff] transition-colors">Pricing</a>
            <a href="#" className="hover:text-[#00ffff] transition-colors">Resources</a>
            <a href="#" className="hover:text-[#00ffff] transition-colors">Projects</a>
          </nav>
          <Button className="bg-[#00ffff] hover:bg-[#00cccc] text-black font-semibold">
            W
          </Button>
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
                onChange={handleSearch}
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
            <div
              key={project.id}
              className="bg-[#1a1a1a] rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-white">{project.title}</h2>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex items-center">
                  <Progress value={project.progress} className="flex-grow mr-4" />
                  <span className="text-sm font-medium text-[#00ffff]">{project.progress}%</span>
                </div>
              </div>
            </div>
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
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="col-span-3 bg-[#2a2a2a] border-[#3a3a3a] text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
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
  )
}