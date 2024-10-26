'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { X, Edit2, Check, Search, ChevronDown } from 'lucide-react';
import debounce from 'lodash/debounce';

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  position: number;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
}

const SortableTask = ({ task, onDelete, onEdit }: { task: Task; onDelete: (id: string) => void; onEdit: (id: string, newTitle: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit(task.id, editedTitle);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-background p-2 mb-2 rounded cursor-move flex justify-between items-center"
    >
      {isEditing ? (
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="mr-2"
          autoFocus
        />
      ) : (
        <span>{task.title}</span>
      )}
      <div className="flex space-x-2">
        <Button onClick={handleEdit} size="sm">
          {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
        </Button>
        <Button onClick={() => onDelete(task.id)} size="sm" variant="destructive">
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};

const TASKS_PER_PAGE = 10;

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, tasks: initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadMoreTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}&page=${page + 1}&limit=${TASKS_PER_PAGE}`);
      if (!response.ok) throw new Error('Failed to load more tasks');
      const newTasks = await response.json();
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more tasks:', error);
      toast.error('Errore nel caricamento di altri task');
    } finally {
      setLoading(false);
    }
  }, [projectId, page]);

  useEffect(() => {
    if (tasks.length === 0) {
      loadMoreTasks();
    }
  }, [tasks.length, loadMoreTasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index,
        }));

        const oldStatus = items[oldIndex].status;
        const newStatus = over?.id.toString().split('-')[0] as 'To Do' | 'In Progress' | 'Completed';
        if (oldStatus !== newStatus) {
          updatedItems[newIndex] = { ...updatedItems[newIndex], status: newStatus };
        }

        // Salvataggio automatico delle posizioni
        debouncedUpdateTaskPositions(updatedItems);

        return updatedItems;
      });
    }
  };

  const debouncedUpdateTaskPositions = useCallback(
    debounce((updatedTasks: Task[]) => {
      updatedTasks.forEach(async (task) => {
        try {
          await fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: task.status,
              position: task.position,
            }),
          });
        } catch (error) {
          console.error('Error updating task position:', error);
        }
      });
    }, 500),
    []
  );

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, title: newTask, status: 'To Do' }),
        });

        if (!response.ok) throw new Error('Failed to add task');

        const addedTask = await response.json();
        setTasks([...tasks, addedTask]);
        setNewTask('');
        toast.success('Task aggiunto con successo');
      } catch (error) {
        console.error('Error adding task:', error);
        toast.error('Errore durante l\'aggiunta del task');
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task eliminato con successo');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Errore durante l\'eliminazione del task');
    }
  };

  const editTask = async (taskId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, title: newTitle } : task
      ));
      toast.success('Task aggiornato con successo');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Errore durante l\'aggiornamento del task');
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Kanban Board</h2>
      <div className="mb-4 flex space-x-2">
        <Input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nuovo task..."
          className="flex-grow"
        />
        <Button onClick={addTask}>Aggiungi Task</Button>
      </div>
      <div className="mb-4 relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cerca task..."
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['To Do', 'In Progress', 'Completed'].map((status) => (
            <div key={status} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                {status} ({filteredTasks.filter(task => task.status === status).length})
              </h3>
              <SortableContext
                items={filteredTasks.filter((task) => task.status === status).map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  {filteredTasks
                    .filter((task) => task.status === status)
                    .sort((a, b) => a.position - b.position)
                    .map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SortableTask task={task} onDelete={deleteTask} onEdit={editTask} />
                      </motion.div>
                    ))}
                </AnimatePresence>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
      {tasks.length % TASKS_PER_PAGE === 0 && (
        <Button 
          onClick={loadMoreTasks} 
          disabled={loading} 
          className="mt-4 w-full"
        >
          {loading ? 'Caricamento...' : 'Carica altri task'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};

export default KanbanBoard;
