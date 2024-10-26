import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const offset = (page - 1) * limit;
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .limit(limit)
      .offset(offset)
      .orderBy(tasks.position);

    return NextResponse.json(projectTasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { projectId, title, status } = await request.json();

  try {
    const newTask = await db.insert(tasks).values({ projectId, title, status }).returning();
    return NextResponse.json(newTask[0]);
  } catch (error) {
    console.error('Failed to insert task:', error);
    return NextResponse.json({ error: 'Failed to save task' }, { status: 500 });
  }
}
