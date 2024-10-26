'use client'

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { notes } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type Note = InferSelectModel<typeof notes>;

interface NoteFormProps {
  note?: Note | null;
  onSave: (data: { title: string; description: string; image?: File }) => void;
  onCancel: () => void;
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [description, setDescription] = useState(note?.content || '');
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      ...(image && { image })
    });
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
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white min-h-[100px]"
        />
      </div>
      <div>
        <Label htmlFor="image">Image (optional)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
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
          className="bg-[#00ffff] hover:bg-[#00cccc] text-black"
        >
          {note ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
}
