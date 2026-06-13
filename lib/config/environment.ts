// lib/config/environment.ts
/**
 * Production-grade environment configuration system
 * Validates all required environment variables at runtime
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional().default('http://localhost:3001'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // OpenAI / AI Services
  NEXT_PUBLIC_OPENAI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),

  // Sentry Error Tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('production'),

  // PostHog Analytics
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Vercel Deployment
  VERCEL_ORG_ID: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  VERCEL_SCOPE: z.string().optional(),

  // 3D & Assets
  NEXT_PUBLIC_3D_ASSET_URL: z.string().default('/models'),
  NEXT_PUBLIC_IMAGE_CDN_URL: z.string().url().optional(),
  NEXT_PUBLIC_ENABLE_WEBGL_DEBUG: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
});

type Environment = z.infer<typeof envSchema>;

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private env: Environment;

  private constructor() {
    try {
      this.env = envSchema.parse(process.env);
      this.validateEnvironment();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n');
        throw new Error(
          `Invalid environment configuration:\n${issues}\n\nCheck .env.example for required variables.`,
        );
      }
      throw error;
    }
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateEnvironment(): void {
    // Validate production requirements
    if (this.env.NODE_ENV === 'production') {
      const requiredProd = [
        'NEXT_PUBLIC_API_URL',
        'NEXT_PUBLIC_SENTRY_DSN',
        'VERCEL_TOKEN',
      ];
      const missing = requiredProd.filter(
        (key) => !process.env[key],
      );
      if (missing.length > 0) {
        console.warn(
          `⚠️  Production environment missing: ${missing.join(', ')}`,
        );
      }
    }

    // Warn about unset optional but recommended variables
    const recommended = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_POSTHOG_KEY',
    ];
    recommended.forEach((key) => {
      if (!process.env[key] && this.env.NODE_ENV !== 'development') {
        console.warn(`💡 Consider setting ${key} for production`);
      }
    });
  }

  // Getters for environment variables
  get nodeEnv(): string {
    return this.env.NODE_ENV;
  }

  get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get isStaging(): boolean {
    return this.env.NODE_ENV === 'staging';
  }

  get apiUrl(): string {
    return this.env.NEXT_PUBLIC_API_URL;
  }

  get supabaseUrl(): string | undefined {
    return this.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  get supabaseAnonKey(): string | undefined {
    return this.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  get supabaseServiceRole(): string | undefined {
    return this.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  get openaiApiKey(): string | undefined {
    return this.env.OPENAI_API_KEY;
  }

  get openaiModel(): string {
    return this.env.NEXT_PUBLIC_OPENAI_MODEL;
  }

  get sentryDsn(): string | undefined {
    return this.env.NEXT_PUBLIC_SENTRY_DSN;
  }

  get posthogKey(): string | undefined {
    return this.env.NEXT_PUBLIC_POSTHOG_KEY;
  }

  get posthogHost(): string | undefined {
    return this.env.NEXT_PUBLIC_POSTHOG_HOST;
  }

  get assetUrl(): string {
    return this.env.NEXT_PUBLIC_3D_ASSET_URL;
  }

  get cdnUrl(): string | undefined {
    return this.env.NEXT_PUBLIC_IMAGE_CDN_URL;
  }

  get webglDebugEnabled(): boolean {
    return this.env.NEXT_PUBLIC_ENABLE_WEBGL_DEBUG;
  }

  /**
   * Get all public environment variables (safe to expose to client)
   */
  getPublicConfig(): Record<string, string | boolean | undefined> {
    return {
      nodeEnv: this.env.NODE_ENV,
      apiUrl: this.env.NEXT_PUBLIC_API_URL,
      supabaseUrl: this.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: this.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      openaiModel: this.env.NEXT_PUBLIC_OPENAI_MODEL,
      sentryDsn: this.env.NEXT_PUBLIC_SENTRY_DSN,
      posthogKey: this.env.NEXT_PUBLIC_POSTHOG_KEY,
      posthogHost: this.env.NEXT_PUBLIC_POSTHOG_HOST,
      assetUrl: this.env.NEXT_PUBLIC_3D_ASSET_URL,
      cdnUrl: this.env.NEXT_PUBLIC_IMAGE_CDN_URL,
      webglDebugEnabled: this.env.NEXT_PUBLIC_ENABLE_WEBGL_DEBUG,
    };
  }
}

// Export singleton instance and helper functions
export const config = EnvironmentConfig.getInstance();

export const getEnv = (key: keyof Environment): Environment[key] => {
  return config[key as any];
};

export type { Environment };
