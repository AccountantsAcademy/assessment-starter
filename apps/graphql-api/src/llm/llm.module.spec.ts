import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { LlmModule } from './llm.module'
import { LlmService } from './llm.service'
import { MockLlmService } from './mock-llm.service'
import { OllamaLlmService } from './ollama-llm.service'

async function resolve(env: Record<string, string>) {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => env] }),
      LlmModule,
    ],
  }).compile()
  return moduleRef.get(LlmService)
}

describe('LlmModule', () => {
  // ConfigService prefers real environment variables (Nx loads .env into
  // them), so clear ours to let each test control the configuration.
  const saved = { ...process.env }
  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (/^(LLM_|OLLAMA_)/.test(key)) delete process.env[key]
    }
  })
  afterAll(() => {
    process.env = saved
  })

  it('provides the mock by default', async () => {
    expect(await resolve({})).toBeInstanceOf(MockLlmService)
  })

  it('provides Ollama when configured', async () => {
    expect(await resolve({ LLM_PROVIDER: 'ollama' })).toBeInstanceOf(
      OllamaLlmService
    )
  })

  it('rejects unknown providers', async () => {
    await expect(resolve({ LLM_PROVIDER: 'gpt' })).rejects.toThrow(
      'Unknown LLM_PROVIDER'
    )
  })

  it('rejects an invalid chaos value', async () => {
    await expect(resolve({ LLM_MOCK_CHAOS: '2' })).rejects.toThrow(
      'LLM_MOCK_CHAOS'
    )
  })

  it('rejects an unknown forced failure', async () => {
    await expect(resolve({ LLM_MOCK_FORCE: 'explode' })).rejects.toThrow(
      'LLM_MOCK_FORCE'
    )
  })
})
