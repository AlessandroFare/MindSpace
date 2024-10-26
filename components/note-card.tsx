'use client'

import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import type { notes, tasks, images } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type Note = InferSelectModel<typeof notes>;
type Task = InferSelectModel<typeof tasks>;
type Image = InferSelectModel<typeof images>;

interface NoteWithDetails extends Note {
  tasks: Task[];
  images: Image[];
}

interface NoteCardProps {
  note: NoteWithDetails;
  onEdit: (note: NoteWithDetails) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'note',
    item: { id: note.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="mb-4 cursor-move bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 hover:bg-[#2a2a2a]">
                  {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  {note.title}
                </Button>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(note)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(note.id)} className="text-red-500">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-gray-400 mb-4">{note.content}</p>
              {note.tasks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {note.tasks.map((task) => (
                    <Card key={task.id} className="bg-[#2a2a2a]">
                      <CardContent className="p-3 flex justify-between items-center">
                        <span>{task.title}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {note.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {note.images.map((img) => (
                    <div key={img.id} className="aspect-square bg-[#2a2a2a] rounded-lg overflow-hidden">
                      <img src={img.imageUrl} alt="Note attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
