import { useEffect, useState } from 'react'
import { Monitor, Plus, Search, Trash2 } from 'lucide-react'
import { api, type Asset } from '@/lib/api'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/ui/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, statusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function AssetsPage() {
  const { isAdmin } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{ name: string; category: string; serial_number: string; status: Asset['status']; location: string }>({
    name: '', category: 'Laptop', serial_number: '', status: 'available', location: '',
  })

  const load = () => api.getAssets().then(setAssets).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createAsset(form)
    setShowForm(false)
    setForm({ name: '', category: 'Laptop', serial_number: '', status: 'available', location: '' })
    load()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this asset?')) {
      await api.deleteAsset(id)
      load()
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Hardware Assets"
        description="Track, assign, and maintain your organization's hardware inventory"
        action={
          isAdmin && (
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          )
        }
      />

      {showForm && isAdmin && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Category</Label><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Laptop</option><option>Monitor</option><option>Mobile</option><option>Printer</option><option>Other</option></Select></div>
              <div className="space-y-2"><Label>Serial Number</Label><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Asset['status'] })}><option value="available">Available</option><option value="assigned">Assigned</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option></Select></div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="flex items-end"><Button type="submit">Save Asset</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-200/40" />
        <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Monitor} title="No assets found" description="Try adjusting your search or add a new asset." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((asset) => (
            <Card key={asset.id} className="group">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
                    <Monitor className="h-5 w-5 text-brand-400" />
                  </div>
                  <Badge variant={statusBadge(asset.status)}>{asset.status}</Badge>
                </div>
                <h3 className="font-semibold text-white">{asset.name}</h3>
                <p className="text-xs text-surface-200/50">{asset.serial_number}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-surface-200/50">Category</span><span className="text-surface-100">{asset.category}</span></div>
                  <div className="flex justify-between"><span className="text-surface-200/50">Assigned to</span><span className="text-surface-100">{asset.assigned_to || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-surface-200/50">Location</span><span className="text-surface-100">{asset.location || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-surface-200/50">Warranty</span><span className="text-surface-100">{formatDate(asset.warranty_expiry)}</span></div>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="sm" className="mt-4 w-full text-red-400 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(asset.id)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
