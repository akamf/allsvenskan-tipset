import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import logoUrl from '@/assets/logo.png'
import { queryClient } from '@/lib/query-client'
import { router } from '@/app/router'
import './index.css'

const favicon =
  document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
  (() => {
    const link = document.createElement('link')
    link.rel = 'icon'
    document.head.append(link)
    return link
  })()

favicon.type = 'image/png'
favicon.href = logoUrl

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
