import { useState } from 'react'
import { BrainCircuit, Sparkles, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Select, Textarea } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

const PROMPTS = [
  'Summarize current asset utilization and suggest optimizations',
  'Identify license compliance risks and recommend actions',
  'Analyze open tickets and prioritize by business impact',
  'Generate a weekly IT operations summary report',
]

export default function AIReportsPage() {
  const [prompt, setPrompt] = useState(PROMPTS[0])
  const [contextType, setContextType] = useState('general')
  const [report, setReport] = useState('')
  const [generatedAt, setGeneratedAt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await api.generateReport(prompt, contextType)
      setReport(res.report)
      setGeneratedAt(res.generated_at)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="AI Reports" description="Generate intelligent insights powered by Ollama/Llama" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-brand-400" />
              <CardTitle>Report Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Context Type</Label>
              <Select value={contextType} onChange={(e) => setContextType(e.target.value)}>
                <option value="general">General Overview</option>
                <option value="assets">Assets</option>
                <option value="licenses">Licenses</option>
                <option value="tickets">Tickets</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quick Prompts</Label>
              <div className="space-y-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs transition-all ${prompt === p ? 'border-brand-500/50 bg-brand-500/10 text-brand-200' : 'border-white/5 bg-white/[0.02] text-surface-200/60 hover:border-white/10'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Prompt</Label>
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2" size="lg">
              {loading ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Report</CardTitle>
              {generatedAt && <span className="text-xs text-surface-200/40">{formatDate(generatedAt)}</span>}
            </div>
          </CardHeader>
          <CardContent>
            {report ? (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap rounded-xl bg-white/[0.02] p-6 text-sm leading-relaxed text-surface-100">
                  {report}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10">
                  <Send className="h-8 w-8 text-brand-400/50" />
                </div>
                <p className="text-surface-200/50">Select a prompt and generate your first AI report</p>
                <p className="mt-1 text-xs text-surface-200/30">Requires Ollama running locally for live AI responses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
