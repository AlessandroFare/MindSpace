import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { projectId, imageUrl } = await request.json();

  try {
    const newImage = await db.insert(images).values({ projectId, imageUrl }).returning();
    return NextResponse.json(newImage[0]);
  } catch (error) {
    console.error('Failed to insert image:', error);
    return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const projectImages = await db.select().from(images).where(eq(images.projectId, projectId));
    return NextResponse.json(projectImages);
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
