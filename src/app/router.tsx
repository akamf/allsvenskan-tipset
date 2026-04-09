import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { DashboardPage } from '@/pages/dashboard-page'
import { HistoryPage } from '@/pages/history-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ParticipantPage } from '@/pages/participant-page'
import { PredictionsPage } from '@/pages/predictions-page'
import { RulesPage } from '@/pages/rules-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'predictions', element: <PredictionsPage /> },
      { path: 'rules', element: <RulesPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'participants/:participantId', element: <ParticipantPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
