// lib/services/ai/hooks.ts
/**
 * React Hooks for AI Service Integration
 * Client-side utilities for AI features
 */

import { useCallback, useState } from 'react';
import { OpenAIService } from './openai';
import { AIResponse, ChatCompletionRequest } from './types';

export const useAIChatCompletion = (
): {
  chat: (request: ChatCompletionRequest) => Promise<AIResponse>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const chat = useCallback(
    async (request: ChatCompletionRequest): Promise<AIResponse> => {
      setLoading(true);
      setError(null);

      try {
        const service = OpenAIService.getInstance();
        const response = await service.chatCompletion(request);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { chat, loading, error };
};

export const useAIProductDescription = (
): {
  generate: (
    productName: string,
    category: string,
    features: string[],
  ) => Promise<string>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (
      productName: string,
      category: string,
      features: string[],
    ): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const service = OpenAIService.getInstance();
        const description = await service.generateProductDescription(
          productName,
          category,
          features,
        );
        return description;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { generate, loading, error };
};

export const useAIRecommendations = (
): {
  generate: (
    userHistory: string[],
    availableProducts: string[],
    limit?: number,
  ) => Promise<string[]>;
  loading: boolean;
  error: Error | null;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (
      userHistory: string[],
      availableProducts: string[],
      limit = 5,
    ): Promise<string[]> => {
      setLoading(true);
      setError(null);

      try {
        const service = OpenAIService.getInstance();
        const recommendations = await service.generateRecommendations(
          userHistory,
          availableProducts,
          limit,
        );
        return recommendations;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { generate, loading, error };
};
