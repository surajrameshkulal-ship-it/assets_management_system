import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/layout/Sidebar'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AssetsPage from '@/pages/AssetsPage'
import LicensesPage from '@/pages/LicensesPage'
import EmployeesPage from '@/pages/EmployeesPage'
import TicketsPage from '@/pages/TicketsPage'
import AIReportsPage from '@/pages/AIReportsPage'
import NotificationsPage from '@/pages/NotificationsPage'

function AppLayout({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/assets" element={<AppLayout><AssetsPage /></AppLayout>} />
          <Route path="/licenses" element={<AppLayout><LicensesPage /></AppLayout>} />
          <Route path="/employees" element={<AppLayout adminOnly><EmployeesPage /></AppLayout>} />
          <Route path="/tickets" element={<AppLayout><TicketsPage /></AppLayout>} />
          <Route path="/ai-reports" element={<AppLayout><AIReportsPage /></AppLayout>} />
          <Route path="/notifications" element={<AppLayout adminOnly><NotificationsPage /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
