import { NextResponse } from 'next/server';
import { db } from '@/db/index';
import { images } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const imageId = params.id;

  try {
    const image = await db.select().from(images).where(eq(images.id, imageId)).limit(1);

    if (image.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Elimina l'immagine da Supabase Storage
    const supabase = createClient();
    const { error: storageError } = await supabase.storage
      .from('project-images')
      .remove([image[0].imageUrl]);

    if (storageError) {
      throw storageError;
    }

    // Elimina il record dell'immagine dal database
    await db.delete(images).where(eq(images.id, imageId));

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
