'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderIcon, UsersIcon, CheckSquareIcon } from 'lucide-react'

export default function DashboardKPI() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    usersCount: 0,
    tasksCount: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()
      
      // Fetch dei dati qui
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return
      }

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        return
      }

      setStats({
        totalProjects: projects.length,
        completedProjects: projects.filter(p => p.progress === 100).length,
        usersCount: users.length,
        tasksCount: tasks.length,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progetti totali</CardTitle>
          <FolderIcon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utenti registrati</CardTitle>
          <UsersIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usersCount}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attività create</CardTitle>
          <CheckSquareIcon className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.tasksCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
