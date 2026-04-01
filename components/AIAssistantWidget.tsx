'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, X, MessageCircle, AlertCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setApiError(null)
    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }])
      } else {
        // Tampilkan error spesifik
        const errMsg = data.message || 'Gagal mendapat respons'
        if (errMsg.includes('API key not configured')) {
          setApiError('GROQ_API_KEY belum diisi di .env')
        } else {
          setApiError(errMsg)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}`, timestamp: new Date(), isError: true }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Tidak bisa terhubung ke server.', timestamp: new Date(), isError: true }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
          style={{ background: '#6b7c4a' }}
          aria-label="Buka AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[560px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ background: '#1e2328' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#6b7c4a' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
                <p className="text-xs" style={{ color: '#a8b89a' }}>Fidyatama POS</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* API Key warning banner */}
          {apiError && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs shrink-0" style={{ background: '#fef3c7', color: '#92400e' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}. Isi <code className="font-mono">GROQ_API_KEY</code> di <code className="font-mono">.env</code></span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f8f8f6' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#6b7c4a' }}>
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1e2328' }}>Halo! Saya AI Assistant</p>
                  <p className="text-xs text-gray-500 mt-1">Tanya apa saja tentang proyek, pelanggan, atau laporan.</p>
                </div>
                <div className="w-full space-y-1.5">
                  {['Berapa total proyek aktif?', 'Siapa pelanggan terbaru?', 'Ringkasan keuangan bulan ini'].map(q => (
                    <button key={q} onClick={() => setInput(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors hover:border-[#6b7c4a]"
                      style={{ borderColor: '#e5e7eb', color: '#6b7281' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: msg.isError ? '#fee2e2' : '#6b7c4a' }}>
                    {msg.isError ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                )}
                <div className={`max-w-[78%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'text-white'
                    : msg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white border shadow-sm text-gray-800'
                }`} style={msg.role === 'user' ? { background: '#6b7c4a' } : {}}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: '#6b7c4a' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border shadow-sm rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#6b7c4a', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t px-3 py-3 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none disabled:bg-gray-50"
                style={{ borderColor: '#e5e7eb' }}
              />
              <button type="submit" disabled={isLoading || !input.trim()}
                className="px-3 py-2 rounded-lg text-white transition-opacity disabled:opacity-40"
                style={{ background: '#6b7c4a' }}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
