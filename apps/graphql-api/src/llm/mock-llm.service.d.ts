/* Generated file: mock LLM for the assessment. Its source is intentionally not part of the exercise. */
import { LlmCompletion, LlmRequest, LlmService } from './llm.service';
export declare const MOCK_LLM_FAILURES: readonly ["timeout", "rate-limit", "malformed-json", "interrupt"];
export type MockLlmFailure = (typeof MOCK_LLM_FAILURES)[number];
export interface MockLlmOptions {
    /** Probability (0–1) that a call misbehaves. 0 = always well-behaved. */
    chaos: number;
    /** Make every call fail in this specific way, to test one error path. */
    force?: MockLlmFailure;
    /** Same seed = same sequence of delays and failures. Random when omitted. */
    seed?: number;
    minDelayMs: number;
    maxDelayMs: number;
    chunkDelayMs: number;
    timeoutMs: number;
}
/**
 * Fake LLM that behaves like a real one: it is slow, streams its output,
 * sometimes fails and does not always respect the requested output format.
 * Answers are rule-based, so the same input gives the same answer.
 */
export declare class MockLlmService extends LlmService {
    constructor(options?: Partial<MockLlmOptions>);
    complete(request: LlmRequest): Promise<LlmCompletion>;
    stream(request: Omit<LlmRequest, 'json'>): AsyncIterable<string>;
}
