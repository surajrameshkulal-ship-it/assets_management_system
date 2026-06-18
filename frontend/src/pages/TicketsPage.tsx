import { useEffect, useState } from 'react'
import { Ticket, Plus } from 'lucide-react'
import { api, type Ticket as TicketType } from '@/lib/api'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/ui/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, statusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' })

  const load = () => api.getTickets().then(setTickets).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createTicket(form)
    setShowForm(false)
    setForm({ title: '', description: '', priority: 'medium' })
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Submit and track IT support requests"
        action={
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" /> New Ticket
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Priority</Label><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></Select></div>
              <Button type="submit">Submit Ticket</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tickets.length === 0 ? (
        <EmptyState icon={Ticket} title="No tickets" description="Create a ticket when you need IT support." />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{ticket.title}</h3>
                    <Badge variant={statusBadge(ticket.priority)}>{ticket.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-surface-200/50 line-clamp-1">{ticket.description}</p>
                  <p className="mt-2 text-xs text-surface-200/40">By {ticket.created_by} · {formatDate(ticket.created_at)}</p>
                </div>
                <Badge variant={statusBadge(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
