import { Bell, Mail } from 'lucide-react'
import { PageHeader } from '@/components/ui/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SAMPLE_NOTIFICATIONS = [
  { title: 'License Expiry Reminder', message: 'Slack Enterprise expires in 14 days', recipient: 'admin@assetflow.io', type: 'reminder' },
  { title: 'Compliance Alert', message: 'Adobe Creative Cloud seats exceeded allocation', recipient: 'admin@assetflow.io', type: 'alert' },
  { title: 'Asset Maintenance', message: 'HP LaserJet Pro scheduled for service', recipient: 'employee@assetflow.io', type: 'info' },
]

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" description="Email alerts, reminders, and system notifications" />

      <div className="space-y-4">
        {SAMPLE_NOTIFICATIONS.map((n, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15">
                <Bell className="h-5 w-5 text-brand-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <Badge variant={n.type === 'alert' ? 'danger' : n.type === 'reminder' ? 'warning' : 'default'}>{n.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-surface-200/60">{n.message}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-surface-200/40">
                  <Mail className="h-3 w-3" />{n.recipient}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
