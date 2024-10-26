import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { projects } from '@/db/schema';

export async function POST(request: Request) {
  const { title, description } = await request.json();

  try {
    const newProject = await db.insert(projects).values({ title, description }).returning();
    return NextResponse.json(newProject[0]);
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
