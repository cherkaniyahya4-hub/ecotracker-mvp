export default function handler(req, res) {
  // Only expose safe, public credentials to the browser
  const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '').trim();

  console.log('[config] ENV keys present:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_PUBLISHABLE_KEY: !!process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: !!process.env.SUPABASE_SECRET_KEY,
    SUPABASE_PROJECT_ID: !!process.env.SUPABASE_PROJECT_ID,
    resolvedUrl: supabaseUrl ? supabaseUrl.slice(0, 30) + '...' : '(empty)',
    resolvedAnonKey: supabaseAnonKey ? supabaseAnonKey.slice(0, 10) + '...' : '(empty)',
  });

  // Validate that credentials are present
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[config] Missing credentials — returning 500');
    res.status(500).json({
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are not set'
    });
    return;
  }

  res.setHeader('Content-Type', 'application/javascript');
  res.status(200).send(`
window.ECOTRACKER_CONFIG = Object.freeze({
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_ANON_KEY: "${supabaseAnonKey}",
});
  `);
}
