'use client'

import { useDrop } from 'react-dnd';
import { NoteCard } from './note-card';
import type { notes, tasks, images } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type Note = InferSelectModel<typeof notes>;
type Task = InferSelectModel<typeof tasks>;
type Image = InferSelectModel<typeof images>;

interface NoteWithDetails extends Note {
  tasks: Task[];
  images: Image[];
}

interface ColumnProps {
  title: string;
  notes: NoteWithDetails[];
  moveNote: (noteId: string, status: string) => void;
  onEdit: (note: NoteWithDetails) => void;
  onDelete: (id: string) => void;
}

export function Column({ title, notes, moveNote, onEdit, onDelete }: ColumnProps) {
  const [, drop] = useDrop(() => ({
    accept: 'note',
    drop: (item: { id: string }) => {
      moveNote(item.id, title);
    },
  }));

  return (
    <div ref={drop} className="bg-[#1a1a1a] rounded-lg overflow-hidden">
      <h3 className="text-lg font-semibold p-4 bg-[#2a2a2a]">{title}</h3>
      <div className="p-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
