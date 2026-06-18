import { useEffect, useState } from 'react'
import { Monitor, KeyRound, Ticket, Users, AlertTriangle, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api, type DashboardStats, type ActivityLog } from '@/lib/api'
import { StatCard, PageHeader, LoadingSpinner } from '@/components/ui/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [distribution, setDistribution] = useState<{ category: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStats(), api.getActivity(), api.getAssetDistribution()])
      .then(([s, a, d]) => {
        setStats(s)
        setActivity(a)
        setDistribution(d)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return null

  const utilizationRate = stats.total_assets > 0 ? Math.round((stats.assigned_assets / stats.total_assets) * 100) : 0

  return (
    <div>
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.full_name?.split(' ')[0]}`}
        description={isAdmin ? 'Overview of your IT infrastructure and compliance status' : 'Your assigned assets and open support tickets'}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Assets" value={stats.total_assets} subtitle={`${utilizationRate}% utilization`} icon={Monitor} />
        <StatCard title="Active Licenses" value={stats.total_licenses} subtitle={`${stats.expiring_licenses} need attention`} icon={KeyRound} trend={stats.expiring_licenses > 0 ? { value: `${stats.expiring_licenses} expiring soon`, positive: false } : undefined} />
        <StatCard title="Open Tickets" value={stats.open_tickets} icon={Ticket} />
        {isAdmin && <StatCard title="Employees" value={stats.total_employees} icon={Users} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Assigned', value: stats.assigned_assets },
                      { name: 'Available', value: stats.available_assets },
                      { name: 'Maintenance', value: stats.maintenance_assets },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CHART_COLORS.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {['Assigned', 'Available', 'Maintenance'].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-surface-200/60">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  {label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.expiring_licenses > 0 && (
        <Card className="mt-6 border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-200">Compliance Alert</p>
              <p className="text-sm text-amber-200/60">
                {stats.expiring_licenses} license{stats.expiring_licenses > 1 ? 's' : ''} require renewal or seat adjustment
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader className="flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-brand-400" />
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.map((log) => (
              <div key={log.id} className="flex items-start gap-4 rounded-xl bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{log.details}</p>
                  <p className="mt-1 text-xs text-surface-200/40">
                    {log.user} · {formatDate(log.timestamp)}
                  </p>
                </div>
                <Badge variant="neutral">{log.action.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
