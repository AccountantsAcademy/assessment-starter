export interface LlmRequest {
  /** Instructions for the model (role, rules, output format). */
  system?: string
  /** The input for this specific call. */
  prompt: string
  /** Ask the model to answer with JSON only. The model may not always comply. */
  json?: boolean
  /** Abort the request, e.g. when the client disconnects. */
  signal?: AbortSignal
}

export interface LlmUsage {
  inputTokens: number
  outputTokens: number
}

export interface LlmCompletion {
  text: string
  usage: LlmUsage
}

/**
 * Provider-agnostic LLM client. Inject it with
 * `constructor(private readonly llm: LlmService) {}`.
 *
 * Which implementation you get is decided by `LLM_PROVIDER` in `.env`.
 */
export abstract class LlmService {
  /** Returns the full answer once the model is done. */
  abstract complete(request: LlmRequest): Promise<LlmCompletion>

  /** Yields the answer in small text chunks as the model generates it. */
  abstract stream(request: Omit<LlmRequest, 'json'>): AsyncIterable<string>
}

export class LlmError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class LlmTimeoutError extends LlmError {
  constructor(timeoutMs: number) {
    super(`LLM request timed out after ${timeoutMs}ms`)
  }
}

export class LlmRateLimitError extends LlmError {
  constructor(readonly retryAfterMs: number) {
    super(`LLM rate limit exceeded, retry after ${retryAfterMs}ms`)
  }
}

export class LlmStreamInterruptedError extends LlmError {
  constructor() {
    super('LLM stream was interrupted')
  }
}

export class LlmAbortedError extends LlmError {
  constructor() {
    super('LLM request was aborted')
  }
}
