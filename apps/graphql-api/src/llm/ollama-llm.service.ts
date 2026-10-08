import {
  LlmAbortedError,
  LlmCompletion,
  LlmError,
  LlmRequest,
  LlmService,
} from './llm.service'

interface OllamaChunk {
  response: string
  done: boolean
  error?: string
  prompt_eval_count?: number
  eval_count?: number
}

/**
 * Real model running locally via Ollama (https://ollama.com).
 * Run `ollama pull <model>` once, then set LLM_PROVIDER=ollama.
 */
export class OllamaLlmService extends LlmService {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string
  ) {
    super()
  }

  async complete(request: LlmRequest): Promise<LlmCompletion> {
    const response = await this.generate(request, false)
    const body = (await response.json()) as OllamaChunk

    return {
      text: body.response,
      usage: {
        inputTokens: body.prompt_eval_count ?? 0,
        outputTokens: body.eval_count ?? 0,
      },
    }
  }

  async *stream(request: Omit<LlmRequest, 'json'>): AsyncIterable<string> {
    const response = await this.generate(request, true)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const chunk = JSON.parse(line) as OllamaChunk
          if (chunk.error) throw new LlmError(chunk.error)
          if (chunk.response) yield chunk.response
        }
      }
    } catch (error) {
      if (request.signal?.aborted) throw new LlmAbortedError()
      throw error
    }
  }

  private async generate(request: LlmRequest, stream: boolean) {
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          system: request.system,
          prompt: request.prompt,
          format: request.json ? 'json' : undefined,
          stream,
        }),
        signal: request.signal,
      })
    } catch (error) {
      if (request.signal?.aborted) throw new LlmAbortedError()
      throw new LlmError(
        `Could not reach Ollama at ${this.baseUrl}. Is it running? (${
          (error as Error).message
        })`
      )
    }

    if (!response.ok) {
      throw new LlmError(
        `Ollama responded with ${response.status}: ${await response.text()}`
      )
    }
    return response
  }
}
