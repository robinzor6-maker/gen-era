// lib/services/ai/types.ts
/**
 * AI Service Type Definitions
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: Date;
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatCompletionRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface TextEmbeddingRequest {
  text: string;
}

export interface TextEmbeddingResponse {
  embedding: number[];
  model: string;
  inputTokens: number;
}

export enum AITaskType {
  PRODUCT_DESCRIPTION = 'product_description',
  PRODUCT_CATEGORIZATION = 'product_categorization',
  CUSTOMER_SUPPORT = 'customer_support',
  PERSONALIZATION = 'personalization',
  CONTENT_GENERATION = 'content_generation',
  CODE_GENERATION = 'code_generation',
  IMAGE_ANALYSIS = 'image_analysis',
}
