'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { createClient } from '@/utils/supabase/client';
import type { projects } from '@/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { ProjectDetailComponent } from '@/components/project-detail';
import { useParams } from 'next/navigation';

type Project = InferSelectModel<typeof projects>;

export default function ProjectDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!user || !params.id) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id, user]);

  if (loading) {
    return <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
      Loading...
    </div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
      Project not found
    </div>;
  }

  return <ProjectDetailComponent project={project} />;
}
