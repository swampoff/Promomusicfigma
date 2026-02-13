/**
 * Environment Configuration
 * Production Supabase credentials
 */

const PRODUCTION_PROJECT_ID = "qzpmiiqfwkcnrhvubdgt";
const PRODUCTION_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzUzMzMsImV4cCI6MjA4NDkxMTMzM30.N3nzO5WooZSPS6U_b4_KEqD1ZIA-82q5_yMHKy-Jsg0";

export const config = {
  // Environment mode
  isLocal: false,
  isProduction: true,
  mode: 'production' as const,
  
  // Supabase URLs
  supabaseUrl: `https://${PRODUCTION_PROJECT_ID}.supabase.co`,
  
  // Supabase Keys
  supabaseAnonKey: PRODUCTION_ANON_KEY,
  
  // Project ID
  projectId: PRODUCTION_PROJECT_ID,
  
  // Service Role Key (не используем на клиенте)
  serviceRoleKey: undefined,
    
  // Edge Functions URL
  functionsUrl: `https://${PRODUCTION_PROJECT_ID}.supabase.co/functions/v1`,
    
  // Storage URL
  storageUrl: `https://${PRODUCTION_PROJECT_ID}.supabase.co/storage/v1`,
};

export default config;
