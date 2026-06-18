import { useEffect, useState } from 'react'
import { KeyRound, AlertTriangle } from 'lucide-react'
import { api, type License } from '@/lib/api'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/ui/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, statusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLicenses().then(setLicenses).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const atRisk = licenses.filter((l) => l.status === 'expiring' || l.status === 'compliance_risk')

  return (
    <div>
      <PageHeader title="Software Licenses" description="Monitor renewals, seat usage, and compliance across your software portfolio" />

      {atRisk.length > 0 && (
        <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <p className="text-sm text-amber-200">{atRisk.length} license{atRisk.length > 1 ? 's' : ''} need immediate attention</p>
          </CardContent>
        </Card>
      )}

      {licenses.length === 0 ? (
        <EmptyState icon={KeyRound} title="No licenses" description="Software licenses will appear here once added." />
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => {
            const seatPercent = license.seats > 0 ? Math.round((license.used_seats / license.seats) * 100) : 0
            return (
              <Card key={license.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                        <KeyRound className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{license.name}</h3>
                          <Badge variant={statusBadge(license.status)}>{license.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-surface-200/50">{license.vendor}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center sm:text-right">
                      <div><p className="text-xs text-surface-200/40">Seats</p><p className="font-semibold text-white">{license.used_seats}/{license.seats}</p></div>
                      <div><p className="text-xs text-surface-200/40">Cost</p><p className="font-semibold text-white">{formatCurrency(license.cost)}</p></div>
                      <div><p className="text-xs text-surface-200/40">Expires</p><p className="font-semibold text-white">{formatDate(license.expiry_date)}</p></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-surface-200/50">
                      <span>Seat utilization</span>
                      <span>{seatPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all ${seatPercent >= 100 ? 'bg-red-500' : seatPercent >= 80 ? 'bg-amber-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(seatPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
