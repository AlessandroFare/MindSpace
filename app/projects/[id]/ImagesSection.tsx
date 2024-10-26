'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast'; // Assicurati di installare react-hot-toast
import { Loader2, X } from 'lucide-react';

interface Image {
  id: string;
  url: string;
}

interface ImagesSectionProps {
  projectId: string;
  images: Image[];
}

const ImagesSection: React.FC<ImagesSectionProps> = ({ projectId, images: initialImages }) => {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      const newImage = { id: data.path, url: urlData.publicUrl };

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, imageUrl: newImage.url }),
      });

      if (!response.ok) throw new Error('Failed to save image metadata');

      setImages([...images, newImage]);
      toast.success('Immagine caricata con successo');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Errore durante il caricamento dell\'immagine');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages(images.filter(img => img.id !== imageId));
      toast.success('Immagine eliminata con successo');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Errore durante l\'eliminazione dell\'immagine');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-primary mb-4">Immagini</h2>
      <AnimatePresence>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <img src={image.url} alt="Project image" className="rounded w-full h-40 object-cover" />
              <button
                onClick={() => deleteImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
      <div className="relative">
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={uploadImage}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          onClick={() => document.getElementById('image-upload')?.click()}
          className="cursor-pointer"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Caricamento...
            </>
          ) : (
            'Carica Immagine'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ImagesSection;
