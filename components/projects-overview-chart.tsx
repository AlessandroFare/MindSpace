"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Brain, Target, Users, Clock } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from "react"

interface Stats {
  projectsCompleted: number;
  activeUsers: number;
  totalHours: number;
  totalIdeas: number;
}

export function ProjectsOverviewChart() {
  const [stats, setStats] = useState<Stats>({
    projectsCompleted: 0,
    activeUsers: 0,
    totalHours: 0,
    totalIdeas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      
      // Fetch completed projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('progress', 100);
      
      // Fetch active users
      const { data: users } = await supabase
        .from('users')
        .select('*');
      
      // Fetch tasks for hours calculation (assuming 1 task = 1 hour)
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*');

      setStats({
        projectsCompleted: projects?.length || 0,
        activeUsers: users?.length || 0,
        totalHours: tasks?.length || 0,
        totalIdeas: Math.floor((tasks?.length || 0) * 1.5) // Approssimazione: 1.5 idee per task
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statsConfig = [
    {
      title: "Projects Completed",
      value: stats.projectsCompleted.toString(),
      description: "Successfully delivered",
      icon: Target,
    },
    {
      title: "Active Users",
      value: `${stats.activeUsers}+`,
      description: "Growing monthly",
      icon: Users,
    },
    {
      title: "Hours Saved",
      value: stats.totalHours.toString(),
      description: "Through automation",
      icon: Clock,
    },
    {
      title: "Ideas Generated",
      value: `${stats.totalIdeas}+`,
      description: "Using AI assistance",
      icon: Brain,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="p-6 bg-[#1A1A1A] border-[#333333] hover:bg-[#222222] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8 text-white" />
              <motion.span 
                className="text-3xl font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              >
                {stat.value}
              </motion.span>
            </div>
            <h3 className="text-lg font-semibold text-[#00FFFF] mb-1">{stat.title}</h3>
            <p className="text-sm text-gray-400">{stat.description}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
