import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { notes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const noteId = params.id;
  const { content } = await request.json();

  try {
    const updatedNote = await db
      .update(notes)
      .set({ content })
      .where(eq(notes.id, noteId))
      .returning();

    if (updatedNote.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(updatedNote[0]);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const noteId = params.id;

  try {
    const deletedNote = await db
      .delete(notes)
      .where(eq(notes.id, noteId))
      .returning();

    if (deletedNote.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
