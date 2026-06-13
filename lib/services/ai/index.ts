// lib/services/ai/index.ts
/**
 * AI Service Layer Public API
 */

export { OpenAIService, createAIService } from './openai';
export {
  useAIChatCompletion,
  useAIProductDescription,
  useAIRecommendations,
} from './hooks';
export type {
  AIMessage,
  AIResponse,
  AIServiceConfig,
  ChatCompletionRequest,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
  AITaskType,
} from './types';
export { AITaskType } from './types';
