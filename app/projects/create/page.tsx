'use client'

import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';

export default function CreateProjectPage() {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(''); // Reset any previous error
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { title, user_id: user.id }
        ]);

      if (error) throw error;
      
      router.push('/projects');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(`Error creating project: ${error.message}`);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold mb-4 text-[#00FFFF]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Crea un nuovo progetto
        </motion.h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo del progetto"
            className="max-w-md bg-white/10 border-white/20 text-white placeholder-white/50"
            required
          />
          <Button className="bg-[#00FFFF] text-black hover:bg-[#00FFFF]/90 font-medium px-8" type="submit">
            Crea Progetto
          </Button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
