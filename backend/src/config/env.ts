import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables safely across CJS/ESM runtimes
if (dotenv && typeof dotenv.config === 'function') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is required'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  NOMINATIM_BASE_URL: z.string().default('https://nominatim.openstreetmap.org'),
  REPORTS_SERVICE_URL: z.string().optional().default('http://localhost:4000/api/v1/mock/reports'),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    if (process.env.NODE_ENV === 'test') {
      return {
        NODE_ENV: 'test',
        PORT: 4000,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/disaster_test',
        DIRECT_URL: process.env.DIRECT_URL || 'postgresql://postgres:postgres@localhost:5432/disaster_test',
        SUPABASE_URL: process.env.SUPABASE_URL || 'https://mock.supabase.co',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'mock-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key',
        GROQ_API_KEY: process.env.GROQ_API_KEY || 'mock-groq-key',
        NOMINATIM_BASE_URL: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
        REPORTS_SERVICE_URL: process.env.REPORTS_SERVICE_URL || 'http://localhost:4000/api/v1/mock/reports',
        CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS) || 300,
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      };
    }
    
    console.error('❌ Environment Variable Validation Failed:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Missing or invalid environment variables. Check your .env file against .env.example');
  }

  return result.data;
}

export const env = loadEnv();
