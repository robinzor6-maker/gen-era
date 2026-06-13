// lib/services/ai/openai.ts
/**
 * OpenAI Integration Service
 * Production-grade AI service layer for GPT integration
 */

import { config } from '@/lib/config';
import {
  AIMessage,
  AIResponse,
  AIServiceConfig,
  ChatCompletionRequest,
  TextEmbeddingRequest,
  TextEmbeddingResponse,
} from './types';

export class OpenAIService {
  private static instance: OpenAIService;
  private config: AIServiceConfig;
  private baseUrl = 'https://api.openai.com/v1';

  private constructor(config: AIServiceConfig) {
    this.config = config;
    this.validateConfig();
  }

  static initialize(config: AIServiceConfig): void {
    OpenAIService.instance = new OpenAIService(config);
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      const apiKey = config.openaiApiKey;
      if (!apiKey) {
        throw new Error(
          'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.',
        );
      }

      OpenAIService.initialize({
        apiKey,
        model: config.openaiModel,
        maxTokens: 2000,
        temperature: 0.7,
      });
    }
    return OpenAIService.instance;
  }

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    if (!this.config.model) {
      throw new Error('OpenAI model is required');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<AIResponse> {
    const messages: AIMessage[] = [];

    // Add system prompt if provided
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    messages.push(...request.messages);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: request.maxTokens || this.config.maxTokens,
          temperature: request.temperature ?? this.config.temperature,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.statusText} (${response.status})`,
        );
      }

      const data = await response.json();

      return {
        id: data.id,
        content: data.choices[0]?.message?.content || '',
        model: data.model,
        finishReason: data.choices[0]?.finish_reason || 'stop',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async createEmbedding(
    request: TextEmbeddingRequest,
  ): Promise<TextEmbeddingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          input: request.text,
          model: 'text-embedding-3-small',
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI Embedding API error: ${response.statusText} (${response.status})`,
        );
      }

      const data = await response.json();

      return {
        embedding: data.data[0]?.embedding || [],
        model: data.model,
        inputTokens: data.usage.prompt_tokens,
      };
    } catch (error) {
      console.error('OpenAI Embedding API Error:', error);
      throw error;
    }
  }

  /**
   * Generate product description using AI
   */
  async generateProductDescription(
    productName: string,
    category: string,
    features: string[],
  ): Promise<string> {
    const response = await this.chatCompletion({
      systemPrompt:
        'You are an expert e-commerce product copywriter. Write compelling, SEO-optimized product descriptions.',
      messages: [
        {
          role: 'user',
          content: `Create a product description for:
          
Product Name: ${productName}
Category: ${category}
Features: ${features.join(', ')}

Write 2-3 sentences that are engaging and highlight benefits, not just features.`,
        },
      ],
      maxTokens: 300,
    });

    return response.content;
  }

  /**
   * Categorize a product based on description
   */
  async categorizeProduct(
    description: string,
    availableCategories: string[],
  ): Promise<string> {
    const response = await this.chatCompletion({
      systemPrompt: 'You are a product categorization expert. Respond with only the category name.',
      messages: [
        {
          role: 'user',
          content: `Categorize this product into one of these categories: ${availableCategories.join(', ')}

Product Description: ${description}

Respond with only the category name.`,
        },
      ],
      maxTokens: 50,
    });

    return response.content.trim();
  }

  /**
   * Generate product recommendations
   */
  async generateRecommendations(
    userHistory: string[],
    availableProducts: string[],
    limit = 5,
  ): Promise<string[]> {
    const response = await this.chatCompletion({
      systemPrompt:
        'You are a personalization expert. Recommend products based on user history.',
      messages: [
        {
          role: 'user',
          content: `Based on user viewing history: ${userHistory.join(', ')}

Available products: ${availableProducts.join(', ')}

Recommend the top ${limit} most relevant products. Return as a JSON array of product names.`,
        },
      ],
      maxTokens: 500,
    });

    try {
      const parsed = JSON.parse(response.content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Generate customer support response
   */
  async generateSupportResponse(
    userQuery: string,
    context: Record<string, string>,
  ): Promise<string> {
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const response = await this.chatCompletion({
      systemPrompt:
        'You are a helpful customer support agent for GEN ERA. Provide clear, professional responses.',
      messages: [
        {
          role: 'user',
          content: `Context:
${contextStr}

Customer Question: ${userQuery}

Provide a helpful and professional response.`,
        },
      ],
      maxTokens: 500,
    });

    return response.content;
  }
}

/**
 * Factory function for easier service initialization
 */
export const createAIService = (config?: AIServiceConfig): OpenAIService => {
  if (config) {
    OpenAIService.initialize(config);
  }
  return OpenAIService.getInstance();
};
