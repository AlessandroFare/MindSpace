'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Brain, Plus, Upload, X, MoreHorizontal, ChevronDown, ChevronRight, Image as ImageIcon, Trash, ArrowLeft, Menu } from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

import type { projects, notes, tasks, images } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link'
import { UserButton, useAuth } from '@clerk/nextjs'

type Project = InferSelectModel<typeof projects>;

// Aggiorniamo le interfacce per includere notes_id
interface TaskDetails {
  id: string;
  notes_id: string | null;
  title: string;
  description: string | null;
  status: 'To Do' | 'In Progress' | 'Testing' | 'Completed' | null;
  position: number | null;
  createdAt: string | null;
  images: {
    id: string;
    image_url: string;
    uploaded_at: string;
  }[];
}

interface ImageDetails {
  id: string;
  notes_id: string | null;  // Cambiato da noteId a notes_id
  imageUrl: string;
  uploadedAt: string | null;
}

interface NoteWithDetails {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: 'To Do' | 'In Progress' | 'Testing' | 'Completed';  // Aggiungiamo Testing qui
  createdAt: string;
  tasks: TaskDetails[];
  images: ImageDetails[];
}

interface NoteCardProps {
  note: NoteWithDetails;
  index: number;
  moveNote: (id: string, status: string) => void;
  onEdit: (note: NoteWithDetails) => void;
  onDelete: (id: string) => void;
  onTaskChange: () => Promise<void>; // Aggiungiamo questa prop per aggiornare i task
}

interface TaskFormProps {
  noteId: string;
  task?: TaskDetails | null;
  onSave: (data: { title: string; description: string; image?: File }) => void;
  onCancel: () => void;
}

function TaskForm({ noteId, task, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    task?.images?.[0]?.image_url || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, image: image || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
        />
      </div>
      {currentImageUrl && (
        <div className="mt-2">
          <Label>Current Image</Label>
          <div className="mt-1 relative">
            <img
              src={currentImageUrl}
              alt="Current task image"
              className="max-w-full h-auto rounded-md"
            />
          </div>
        </div>
      )}
      <div>
        <Label htmlFor="image">
          {currentImageUrl ? 'Replace Image' : 'Add Image'}
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-[#2a2a2a] text-white border-[#3a3a3a] hover:bg-[#3a3a3a]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#00ffff] hover:bg-[#00cccc] text-black font-semibold"
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}

const NoteCard = ({ note, index, moveNote, onEdit, onDelete, onTaskChange }: NoteCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'note',
    item: { id: note.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const { getToken } = useAuth(); // Spostiamo useAuth qui, a livello di componente
  const [isOpen, setIsOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetails | null>(null);

  // Aggiungiamo la funzione handleDeleteTask
  const handleDeleteTask = async (taskId: string) => {
    try {
      const supabase = createClient();

      // Prima eliminiamo le immagini associate al task
      await supabase
        .from('images')
        .delete()
        .eq('task_id', taskId);

      // Poi eliminiamo il task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Aggiorniamo lo stato locale attraverso onTaskChange
      await onTaskChange();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddTask = async (taskData: { title: string; description: string; image?: File }) => {
    try {
      const supabase = createClient();
      
      if (editingTask) {
        const { error: taskError } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
          })
          .eq('id', editingTask.id);

        if (taskError) throw taskError;

        if (taskData.image) {
          try {
            const timestamp = Date.now();
            const fileExt = taskData.image.name.split('.').pop();
            const fileName = `${timestamp}.${fileExt}`;
            const filePath = `${editingTask.id}/${fileName}`;

            // Upload del file con configurazione corretta
            const { error: uploadError } = await supabase.storage
              .from('task-images')
              .upload(filePath, taskData.image, {
                cacheControl: '3600',
                contentType: taskData.image.type,
                upsert: true // Aggiungiamo questa opzione
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('task-images')
              .getPublicUrl(filePath);

            const { error: imageError } = await supabase
              .from('images')
              .insert({
                task_id: editingTask.id,
                image_url: publicUrl,
                uploaded_at: new Date().toISOString()
              });

            if (imageError) throw imageError;
          } catch (uploadError: any) {
            console.error('Upload error details:', {
              error: uploadError,
              message: uploadError?.message || 'Unknown error',
              stack: uploadError?.stack || '',
              name: uploadError?.name || ''
            });
            throw new Error(`Upload failed: ${uploadError?.message || 'Unknown error'}`);
          }
        }
      } else {
        // Creazione nuovo task (stessa logica per l'upload delle immagini)
        const { data: newTask, error: taskError } = await supabase
          .from('tasks')
          .insert({
            notes_id: note.id,
            title: taskData.title,
            description: taskData.description,
            status: 'To Do'
          })
          .select()
          .single();

        if (taskError) throw taskError;

        if (taskData.image && newTask) {
          try {
            const timestamp = Date.now();
            const fileExt = taskData.image.name.split('.').pop();
            const fileName = `${timestamp}.${fileExt}`;
            const filePath = `${newTask.id}/${fileName}`;

            // Upload del file con configurazione corretta
            const { error: uploadError } = await supabase.storage
              .from('task-images')
              .upload(filePath, taskData.image, {
                cacheControl: '3600',
                contentType: taskData.image.type,
                upsert: true // Aggiungiamo questa opzione
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('task-images')
              .getPublicUrl(filePath);

            const { error: imageError } = await supabase
              .from('images')
              .insert({
                task_id: newTask.id,
                image_url: publicUrl,
                uploaded_at: new Date().toISOString()
              });

            if (imageError) throw imageError;
          } catch (uploadError: any) {
            console.error('Upload error details:', {
              error: uploadError,
              message: uploadError?.message || 'Unknown error',
              stack: uploadError?.stack || '',
              name: uploadError?.name || ''
            });
            throw new Error(`Upload failed: ${uploadError?.message || 'Unknown error'}`);
          }
        }
      }

      setIsTaskDialogOpen(false);
      setEditingTask(null);
      await onTaskChange();
    } catch (error: any) {
      console.error('Complete error details:', {
        error,
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        name: error?.name || ''
      });
      alert(`Error: ${error?.message || 'Something went wrong'}`);
    }
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="mb-2 cursor-move bg-[#1E1E1E] border-[#333333] shadow-lg">
          <CardHeader className="p-2 border-b border-[#333333]">
            <div className="flex items-center justify-between gap-1">
              <CollapsibleTrigger asChild className="flex-1 min-w-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 hover:bg-transparent hover:text-[#00ffff] transition-colors text-white flex items-center w-full justify-start"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 mr-1.5 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1.5 flex-shrink-0" />}
                  <span className="truncate text-sm">{note.title}</span>
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTaskDialogOpen(true);
                  }}
                  className="hover:bg-[#2a2a2a] text-[#00ffff] hover:text-[#00ffff] px-1.5 h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-[#2a2a2a] text-gray-400 hover:text-white px-1.5 h-7"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1E1E1E] border-[#333333] w-32">
                    <DropdownMenuItem onSelect={() => onEdit(note)} className="hover:bg-[#2a2a2a] text-white text-xs">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDelete(note.id)} className="text-red-400 hover:bg-[#2a2a2a] hover:text-red-400 text-xs">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-2 pt-1.5 bg-[#1E1E1E]">
              <p className="text-xs text-gray-400 mb-2">{note.content}</p>
              <div className="space-y-1.5">
                {note.tasks.map((task) => (
                  <Card key={task.id} className="bg-[#252525] border-[#333333] hover:bg-[#2a2a2a] transition-colors">
                    <CardContent className="p-2">
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate text-xs">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                          )}
                          {task.images && task.images.length > 0 && (
                            <div className="mt-2">
                              <img
                                src={task.images[0].image_url}
                                alt={`Image for ${task.title}`}
                                className="max-w-full h-auto rounded-md"
                              />
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-[#333333] text-gray-400 hover:text-white flex-shrink-0 px-1.5 h-6"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1E1E1E] border-[#333333] w-32">
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingTask(task);
                                setIsTaskDialogOpen(true);
                              }} 
                              className="hover:bg-[#2a2a2a] text-white text-xs"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)} 
                              className="text-red-400 hover:bg-[#2a2a2a] hover:text-red-400 text-xs"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dialog per aggiungere/modificare task */}
      <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
        setIsTaskDialogOpen(open);
        if (!open) setEditingTask(null);
      }}>
        <DialogContent className="bg-[#1a1a1a] text-white max-h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 bg-[#1a1a1a] border-b border-[#333333] px-6 py-4">
            <div> {/* Rimosso il flex container e il pulsante di chiusura */}
              <DialogTitle className="text-xl font-semibold">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-1">
                {editingTask ? 'Edit your task details.' : 'Add a new task to your note.'}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <TaskForm
              noteId={note.id}
              task={editingTask}
              onSave={handleAddTask}
              onCancel={() => {
                setIsTaskDialogOpen(false);
                setEditingTask(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ColumnProps {
  title: string;
  notes: NoteWithDetails[];
  moveNote: (id: string, status: string) => void;
  onEdit: (note: NoteWithDetails) => void;
  onDelete: (id: string) => void;
  onTaskChange: () => Promise<void>;
}

const Column = ({ title, notes, moveNote, onEdit, onDelete, onTaskChange }: ColumnProps) => {
  const [, drop] = useDrop(() => ({
    accept: 'note',
    drop: (item: { id: string }) => moveNote(item.id, title),
  }));

  return (
    <div ref={drop} className="bg-[#1a1a1a] rounded-lg overflow-hidden h-full flex flex-col"> {/* Aggiungiamo h-full e flex flex-col */}
      <h3 className="text-lg font-semibold p-3 bg-[#252525] text-white flex-shrink-0"> {/* Aggiungiamo flex-shrink-0 */}
        {title}
      </h3>
      <div className="p-2 flex-1 overflow-y-auto"> {/* Aggiungiamo flex-1 e overflow-y-auto */}
        {notes.map((note, index) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            index={index} 
            moveNote={moveNote} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onTaskChange={onTaskChange}
          />
        ))}
      </div>
    </div>
  );
};

// Aggiungiamo l'interfaccia ProjectDetailComponentProps
interface ProjectDetailComponentProps {
  project: Project;
}

// Aggiorniamo l'interfaccia NoteFormProps rimuovendo l'immagine
interface NoteFormProps {
  note: NoteWithDetails | null;
  onSave: (data: { title: string; content: string }) => void;
  onCancel: () => void;
}

// Semplifichiamo il NoteForm
function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
        />
      </div>
      <div>
        <Label htmlFor="content">Description</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white min-h-[100px]"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-[#2a2a2a] text-white border-[#3a3a3a] hover:bg-[#3a3a3a]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#00ffff] hover:bg-[#00cccc] text-black"
        >
          {note ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
}

export function ProjectDetailComponent({ project }: ProjectDetailComponentProps) {
  const [notes, setNotes] = useState<{ [key: string]: NoteWithDetails[] }>({
    'To Do': [],
    'In Progress': [],
    'Testing': [],     // Aggiungiamo il nuovo status
    'Completed': []
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithDetails | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Funzione per creare una nuova nota
  const handleSaveNote = async (noteData: { title: string; content: string }) => {
    try {
      const supabase = createClient();
      
      if (editingNote) {
        // Se abbiamo una nota da modificare, facciamo l'update
        const { error: noteError } = await supabase
          .from('notes')
          .update({
            title: noteData.title,
            content: noteData.content
          })
          .eq('id', editingNote.id);

        if (noteError) throw noteError;
      } else {
        // Altrimenti creiamo una nuova nota
        const { error: noteError } = await supabase
          .from('notes')
          .insert([{
            project_id: project.id,
            title: noteData.title,
            content: noteData.content,
            status: 'To Do'
          }]);

        if (noteError) throw noteError;
      }

      // Aggiorniamo lo stato locale
      await fetchNotes();
      // Resettiamo lo stato
      setIsDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // Funzione per aggiornare una nota esistente
  const handleEdit = async (note: NoteWithDetails) => {
    // Settiamo la nota da modificare
    setEditingNote(note);
    // Apriamo il dialog
    setIsDialogOpen(true);
  };

  // Funzione per eliminare una nota
  const handleDelete = async (noteId: string) => {
    try {
      const supabase = createClient();
      
      // Prima eliminiamo le immagini associate
      await supabase
        .from('images')
        .delete()
        .eq('project_id', project.id)
        .eq('note_id', noteId);

      // Poi eliminiamo la nota
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Aggiorniamo lo stato locale
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Funzione per spostare una nota
  const moveNote = async (noteId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      
      // Aggiorniamo lo status della nota
      const { error: noteError } = await supabase
        .from('notes')
        .update({ status: newStatus })
        .eq('id', noteId);

      if (noteError) throw noteError;

      // Aggiorniamo lo stato locale delle note
      await fetchNotes();

      // Calcoliamo il nuovo progresso
      const allNotes = Object.values(notes).flat();
      const totalNotes = allNotes.length;
      const completedNotes = allNotes.filter(note => note.status === 'Completed').length;
      const newProgress = totalNotes > 0 ? Number((completedNotes / totalNotes * 100).toFixed(2)) : 0;

      // Aggiorniamo il progresso del progetto
      const { error: projectError } = await supabase
        .from('projects')
        .update({ progress: newProgress })
        .eq('id', project.id);

      if (projectError) throw projectError;

    } catch (error) {
      console.error('Error moving note:', error);
    }
  };

  // Funzione per recuperare tutte le note
  const fetchNotes = async () => {
    if (!project.id) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          project_id,
          title,
          content,
          status,
          created_at,
          tasks (
            id,
            notes_id,
            title,
            description,
            status,
            position,
            created_at,
            images (
              id,
              image_url,
              uploaded_at
            )
          )
        `)
        .eq('project_id', project.id);

      if (error) throw error;

      const organizedNotes: { [key: string]: NoteWithDetails[] } = {
        'To Do': [],
        'In Progress': [],
        'Testing': [],
        'Completed': []
      };

      data?.forEach(note => {
        const status = note.status || 'To Do';
        if (status in organizedNotes) {
          const formattedNote: NoteWithDetails = {
            id: note.id,
            projectId: note.project_id,
            title: note.title || '',
            content: note.content || '',
            status: note.status || 'To Do',
            createdAt: note.created_at,
            tasks: note.tasks.map(task => ({
              id: task.id,
              notes_id: task.notes_id,
              title: task.title,
              description: task.description,
              status: task.status,
              position: task.position,
              createdAt: task.created_at,
              images: task.images // Aggiungiamo le immagini direttamente dal risultato della query
            })),
            images: []
          };
          organizedNotes[status].push(formattedNote);
        }
      });

      setNotes(organizedNotes);
    } catch (err: any) {
      console.error('Error fetching notes:', err.message || err);
    }
  };

  // Aggiungiamo la dipendenza project.id all'useEffect
  useEffect(() => {
    if (project.id) {
      fetchNotes();
    }
  }, [project.id]);

  const totalNotes = Object.values(notes).flat().length
  const completedNotes = notes['Completed'].length
  const progress = (completedNotes / totalNotes) * 100

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#111111] text-white font-sans">
        {/* Header aggiornato con menu mobile */}
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
                <UserButton afterSignOutUrl="/" />
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
                      href="/dashboard" 
                      className="hover:text-[#00ffff] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
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

        <main className="container mx-auto px-2 sm:px-4 py-8"> {/* Ridotto il padding su mobile */}
          <div className="mb-8">
            <Link href="/projects" className="text-[#00ffff] hover:underline mb-4 inline-block">
              <ArrowLeft className="inline-block mr-2 h-4 w-4" /> Back to Projects
            </Link>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                <p className="text-gray-400">{project.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="bg-[#00ffff] hover:bg-[#00cccc] text-black font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" /> New Note
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Progress value={progress} className="w-full" />
              <span className="text-sm font-medium text-[#00ffff]">{progress.toFixed(2)}% Complete</span>
            </div>
          </div>

          {/* Modifichiamo il container delle colonne */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 h-full">
            {Object.entries(notes).map(([status, noteList]) => (
              <div key={status} className="min-w-[250px] h-full"> {/* Aggiungiamo h-full qui */}
                <Column 
                  title={status} 
                  notes={noteList} 
                  moveNote={moveNote} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onTaskChange={async () => {
                    await fetchNotes();
                  }}
                />
              </div>
            ))}
          </div>
        </main>

        {/* Dialog per nuova nota con stile aggiornato */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingNote(null);
        }}>
          <DialogContent className="bg-[#1a1a1a] text-white max-h-[90vh] flex flex-col">
            <DialogHeader className="sticky top-0 bg-[#1a1a1a] border-b border-[#333333] px-6 py-4">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400 mt-1">
                  {editingNote ? 'Edit your note details.' : 'Add a new note to your project.'}
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <NoteForm 
                note={editingNote} 
                onSave={handleSaveNote}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingNote(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  )
}
