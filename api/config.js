export default function handler(req, res) {
  const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

  res.setHeader('Content-Type', 'application/javascript');
  res.status(200).send(`
window.ECOTRACKER_CONFIG = Object.freeze({
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_ANON_KEY: "${supabaseAnonKey}",
});
  `);
}
