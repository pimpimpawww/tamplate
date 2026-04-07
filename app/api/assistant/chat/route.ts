import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { tools, executeTool } from '@/lib/ai-tools'

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'AI API key not configured' },
        { status: 500 }
      )
    }

    // Determine which API to use
    const isGroq = !!process.env.GROQ_API_KEY
    const apiUrl = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions'

    const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'

    let conversationMessages = [
      {
        role: 'system',
        content: `Kamu adalah asisten AI untuk aplikasi Fidyatama Access — sistem POS dan manajemen proyek milik Fidyatama Design, Build, and Demolis Contractor. Jawab dalam bahasa Indonesia dengan jelas dan informatif.

Kamu punya akses ke data sistem melalui function tools. Gunakan tools ini untuk menjawab pertanyaan tentang proyek, pelanggan, pembayaran, dan laporan keuangan.

User yang sedang chat: ${session.email} (Role: ${session.role})`,
      },
      ...messages,
    ]

    // First API call with tools
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: conversationMessages,
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('AI API error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to get AI response' },
        { status: 500 }
      )
    }

    let data = await response.json()
    let assistantMessage = data.choices[0]?.message

    // Handle tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      conversationMessages.push(assistantMessage)

      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}')

        console.log('Executing tool:', toolName, 'with args:', toolArgs)

        try {
          const toolResult = await executeTool(toolName, toolArgs)
          
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          })
        } catch (error: any) {
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message }),
          })
        }
      }

      // Second API call with tool results
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: conversationMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('AI API error (second call):', error)
        return NextResponse.json(
          { success: false, message: 'Failed to get AI response' },
          { status: 500 }
        )
      }

      data = await response.json()
      assistantMessage = data.choices[0]?.message
    }

    const aiMessage = assistantMessage?.content || 'Maaf, saya tidak bisa menjawab.'

    return NextResponse.json({
      success: true,
      message: aiMessage,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
