export default function handler(req, res) {
  // Only expose safe, public credentials to the browser
  const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

  // Validate that credentials are present
  if (!supabaseUrl || !supabaseAnonKey) {
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
