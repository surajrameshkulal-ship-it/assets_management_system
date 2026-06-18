import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Boxes, Eye, EyeOff } from 'lucide-react'
import { useAuth, ApiError } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin@assetflow.io')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-2xl shadow-brand-500/40">
            <Boxes className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Welcome to <span className="gradient-text">AssetFlow</span>
          </h1>
          <p className="mt-2 text-sm text-surface-200/60">IT Asset & License Management Platform</p>
        </div>

        <Card className="border-white/10 shadow-2xl shadow-black/40">
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Use your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200/40 hover:text-surface-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-surface-200/40">Demo accounts</p>
              <div className="space-y-1.5 text-xs text-surface-200/60">
                <p><span className="text-brand-400">Admin:</span> admin@assetflow.io / admin123</p>
                <p><span className="text-brand-400">Employee:</span> employee@assetflow.io / employee123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
