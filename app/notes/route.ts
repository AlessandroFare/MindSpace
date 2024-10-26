import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { notes } from '@/db/schema';

export async function POST(request: Request) {
  const { projectId, content } = await request.json();

  try {
    const [newNote] = await db.insert(notes).values({ projectId, content }).returning();
    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Failed to insert note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
