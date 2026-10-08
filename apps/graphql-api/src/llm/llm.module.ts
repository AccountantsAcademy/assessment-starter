import { Global, Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LlmService } from './llm.service'
import {
  MOCK_LLM_FAILURES,
  MockLlmFailure,
  MockLlmService,
} from './mock-llm.service'
import { OllamaLlmService } from './ollama-llm.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LlmService,
      inject: [ConfigService],
      useFactory: (config: ConfigService): LlmService => {
        const provider = config.get('LLM_PROVIDER', 'mock')

        switch (provider) {
          case 'mock': {
            const chaos = Number(config.get('LLM_MOCK_CHAOS', 0.1))
            if (Number.isNaN(chaos) || chaos < 0 || chaos > 1) {
              throw new Error('LLM_MOCK_CHAOS must be a number between 0 and 1')
            }
            const force = config.get<MockLlmFailure>('LLM_MOCK_FORCE')
            if (force && !MOCK_LLM_FAILURES.includes(force)) {
              throw new Error(
                `LLM_MOCK_FORCE must be one of: ${MOCK_LLM_FAILURES.join(', ')}`
              )
            }
            const seed = config.get('LLM_MOCK_SEED')
            Logger.log(
              `Using mock LLM (chaos: ${chaos}, seed: ${seed ?? 'random'})`,
              'LlmModule'
            )
            if (force) {
              Logger.warn(
                `Every mock LLM call will fail with: ${force}`,
                'LlmModule'
              )
            }
            return new MockLlmService({
              chaos,
              force,
              seed: seed === undefined ? undefined : Number(seed),
            })
          }
          case 'ollama': {
            const url = config.get('OLLAMA_URL', 'http://localhost:11434')
            const model = config.get('OLLAMA_MODEL', 'llama3.2')
            Logger.log(`Using Ollama LLM (${model} at ${url})`, 'LlmModule')
            return new OllamaLlmService(url, model)
          }
          default:
            throw new Error(
              `Unknown LLM_PROVIDER "${provider}". Use "mock" or "ollama".`
            )
        }
      },
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
