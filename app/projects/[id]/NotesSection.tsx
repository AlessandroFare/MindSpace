'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { X, Edit2, Check } from 'lucide-react';

interface Note {
  id: string;
  content: string;
}

interface NotesSectionProps {
  projectId: string;
  notes: Note[];
}

const NotesSection: React.FC<NotesSectionProps> = ({ projectId, notes: initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const addNote = async () => {
    if (newNote.trim()) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId, content: newNote }),
        });

        if (!response.ok) throw new Error('Failed to add note');

        const savedNote = await response.json();
        setNotes([...notes, savedNote]);
        setNewNote('');
        toast.success('Nota aggiunta con successo');
      } catch (error) {
        console.error('Failed to save note:', error);
        toast.error('Errore durante l\'aggiunta della nota');
      }
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditedContent(note.content);
  };

  const saveEdit = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!response.ok) throw new Error('Failed to update note');

      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, content: editedContent } : note
      ));
      setEditingNoteId(null);
      toast.success('Nota aggiornata con successo');
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Errore durante l\'aggiornamento della nota');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Nota eliminata con successo');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Errore durante l\'eliminazione della nota');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Note</h2>
      <div className="space-y-4 mb-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-background p-3 rounded flex justify-between items-center">
            {editingNoteId === note.id ? (
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-grow mr-2"
              />
            ) : (
              <span>{note.content}</span>
            )}
            <div className="flex space-x-2">
              {editingNoteId === note.id ? (
                <Button onClick={() => saveEdit(note.id)} size="sm">
                  <Check size={16} />
                </Button>
              ) : (
                <Button onClick={() => startEditing(note)} size="sm">
                  <Edit2 size={16} />
                </Button>
              )}
              <Button onClick={() => deleteNote(note.id)} size="sm" variant="destructive">
                <X size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Aggiungi una nota..."
          className="flex-grow"
        />
        <Button onClick={addNote}>Aggiungi</Button>
      </div>
    </motion.div>
  );
};

export default NotesSection;
