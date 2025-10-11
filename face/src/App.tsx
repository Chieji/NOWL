import { useEffect, useMemo, useState } from 'react'
import { Settings2, Mic, Paperclip, Send, Shuffle } from 'lucide-react'
import './index.css'

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">The Best of AI Unified Into One</h1>
        <p className="text-secondary text-xs">OpenAI • Anthropic • Groq • Together • Cohere</p>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card-surface p-4">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-secondary text-xs">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && <div className="mt-3 text-sm text-secondary">{children}</div>}
    </div>
  )
}

function ChatBar() {
  const [text, setText] = useState('')
  const onSend = () => {
    // TODO: wire to LLM routing
    setText('')
  }
  return (
    <div className="card-surface p-2 flex items-center gap-2">
      <button aria-label="Change model" className="p-2 hover:bg-white/10 rounded">
        <Shuffle size={18} />
      </button>
      <button aria-label="Settings" className="p-2 hover:bg-white/10 rounded">
        <Settings2 size={18} />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask anything"
        className="flex-1 bg-transparent outline-none text-sm px-2 placeholder:text-slate-500"
      />
      <button aria-label="Attach" className="p-2 hover:bg-white/10 rounded">
        <Paperclip size={18} />
      </button>
      <button aria-label="Voice" className="p-2 hover:bg-white/10 rounded">
        <Mic size={18} />
      </button>
      <button
        aria-label="Send"
        onClick={onSend}
        className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded hover:opacity-90"
      >
        <Send size={16} />
      </button>
    </div>
  )
}

function App() {
  const [onFacebook, setOnFacebook] = useState<boolean | null>(null)

  useEffect(() => {
    chrome?.runtime?.sendMessage?.({ type: 'PING' }, () => {
      // ignore
    })

    // Check if active tab is facebook via background stored flag (best-effort)
    try {
      chrome.tabs?.query?.({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        const tab = tabs?.[0]
        if (!tab?.id) return
        chrome.storage?.session?.get?.([`fb_detected_${tab.id}`], (data: Record<string, unknown>) => {
          setOnFacebook(Boolean(data?.[`fb_detected_${tab.id}`]))
        })
      })
    } catch {}
  }, [])

  const fbBanner = useMemo(() => {
    if (onFacebook === null) return null
    return (
      <div className="text-xs text-secondary">
        {onFacebook ? 'Facebook detected in current tab' : 'Open facebook.com to enable automation'}
      </div>
    )
  }, [onFacebook])

  return (
    <div className="min-h-[600px] w-[400px] p-4 flex flex-col gap-3">
      <Header />
      <Section title="Use Cases" icon="🎯">Pre-built automation workflows (coming soon)</Section>
      <Section title="Connect Apps" icon="🔌">Manage LLM providers and MCP servers (coming soon)</Section>
      <Section title="Expert Agents" icon="🤖">Specialized personas for tasks (coming soon)</Section>

      <div className="mt-auto flex flex-col gap-2">
        {fbBanner}
        <ChatBar />
      </div>
    </div>
  )
}

export default App
