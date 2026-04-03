import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[inject-config] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_KEY) must be set.');
  console.error('[inject-config] Present SUPABASE_* keys:', Object.keys(process.env).filter(k => k.startsWith('SUPABASE')));
  process.exit(1);
}

const dest = path.join(__dirname, '..', 'src', 'config', 'runtime-config.js');

const content = `// Auto-generated at build time by scripts/inject-config.js — do not edit manually.
window.ECOTRACKER_CONFIG = Object.freeze({
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_ANON_KEY: "${supabaseAnonKey}",
});
window.__runtimeConfigReady = Promise.resolve();
`;

fs.writeFileSync(dest, content, 'utf8');
console.log('[inject-config] runtime-config.js written successfully.');
