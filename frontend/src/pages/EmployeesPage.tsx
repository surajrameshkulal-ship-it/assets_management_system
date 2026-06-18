import { useEffect, useState } from 'react'
import { Users, Mail, Phone } from 'lucide-react'
import { api, type Employee } from '@/lib/api'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/ui/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEmployees().then(setEmployees).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const departments = [...new Set(employees.map((e) => e.department))]

  return (
    <div>
      <PageHeader title="Employees" description="Manage team members and their asset assignments" />

      <div className="mb-6 flex flex-wrap gap-2">
        {departments.map((dept) => (
          <Badge key={dept} variant="neutral">{dept} · {employees.filter((e) => e.department === dept).length}</Badge>
        ))}
      </div>

      {employees.length === 0 ? (
        <EmptyState icon={Users} title="No employees" description="Employee records will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <Card key={emp.id}>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-lg font-bold text-white">
                    {emp.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{emp.full_name}</h3>
                    <p className="text-xs text-surface-200/50">{emp.job_title || 'Team Member'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-surface-200/60"><Mail className="h-3.5 w-3.5" />{emp.email}</div>
                  {emp.phone && <div className="flex items-center gap-2 text-surface-200/60"><Phone className="h-3.5 w-3.5" />{emp.phone}</div>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="neutral">{emp.department}</Badge>
                  <Badge variant={emp.status === 'active' ? 'success' : 'neutral'}>{emp.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
