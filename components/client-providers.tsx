'use client'

import dynamic from 'next/dynamic'

const DashboardKPI = dynamic(() => import('@/components/DashboardKPI'), {
  ssr: false
})

export function ClientProviders() {
  return <DashboardKPI />
}
