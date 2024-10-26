'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (user) {
    return (
      <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover" onClick={signOut}>
        Logout
      </button>
    )
  }

  return (
    <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover" onClick={() => router.push('/login')}>
      Login
    </button>
  )
}
