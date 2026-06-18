import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Monitor,
  KeyRound,
  Users,
  Ticket,
  BrainCircuit,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'employee'] },
  { to: '/assets', icon: Monitor, label: 'Assets', roles: ['admin', 'employee'] },
  { to: '/licenses', icon: KeyRound, label: 'Licenses', roles: ['admin', 'employee'] },
  { to: '/employees', icon: Users, label: 'Employees', roles: ['admin'] },
  { to: '/tickets', icon: Ticket, label: 'Tickets', roles: ['admin', 'employee'] },
  { to: '/ai-reports', icon: BrainCircuit, label: 'AI Reports', roles: ['admin', 'employee'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin'] },
]

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNav = navItems.filter((item) =>
    isAdmin ? item.roles.includes('admin') : item.roles.includes('employee')
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-surface-950/80 backdrop-blur-2xl transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/30">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-base font-bold text-white">AssetFlow</p>
            <p className="text-[10px] uppercase tracking-widest text-brand-400">IT Management</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-600/20 text-brand-300 shadow-inner shadow-brand-500/10'
                  : 'text-surface-200/60 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-xl bg-white/5 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">{user.full_name}</p>
            <p className="truncate text-xs text-surface-200/50">{user.email}</p>
            <span className="mt-1 inline-block rounded-md bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
              {user.role}
            </span>
          </div>
        )}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {!collapsed && (
            <Button variant="ghost" className="flex-1 justify-start gap-2 text-red-400 hover:text-red-300" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
      <Sidebar />
      <main className="relative ml-64 min-h-screen p-6 transition-all duration-300 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
