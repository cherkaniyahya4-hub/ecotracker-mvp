import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const loadEnvFile = (envPath) => {
  if (!fs.existsSync(envPath)) return;
  dotenv.config({ path: envPath });
};

// Load shared env first, then local overrides (without overwriting existing vars).
loadEnvFile('.env');
loadEnvFile('.env.local');

const sanitizeConfigValue = (value) => {
  const next = String(value || '').trim();
  if (!next) return '';
  if (next.toLowerCase().includes('your_supabase_')) return '';
  return next;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const routeAliases = {
  '/index': '/pages/index.html',
  '/index.html': '/pages/index.html',
  '/login': '/pages/login.html',
  '/login.html': '/pages/login.html',
  '/dashboard': '/pages/dashboard.html',
  '/dashboard.html': '/pages/dashboard.html',
  '/goals': '/pages/goals.html',
  '/goals.html': '/pages/goals.html',
  '/profile': '/pages/profile.html',
  '/profile.html': '/pages/profile.html',
  '/scan': '/pages/scan.html',
  '/scan.html': '/pages/scan.html',
  '/market': '/pages/market.html',
  '/market.html': '/pages/market.html',
  '/admin': '/pages/admin.html',
  '/admin.html': '/pages/admin.html',
  '/premieum': '/pages/premieum.html',
  '/premieum.html': '/pages/premieum.html',
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let requestPath = requestUrl.pathname;
  requestPath = routeAliases[requestPath] || requestPath;
  let filePath = path.join(__dirname, requestPath === '/' ? 'pages/index.html' : requestPath);

  // Handle runtime-config.js specially to inject env variables
  if (requestPath === '/src/config/runtime-config.js') {
    const envSupabaseUrl = sanitizeConfigValue(process.env.SUPABASE_URL);
    const envSupabaseAnonKey = sanitizeConfigValue(process.env.SUPABASE_ANON_KEY);
    const runtimeConfigPath = path.join(__dirname, 'src/config/runtime-config.js');

    if (!envSupabaseUrl || !envSupabaseAnonKey) {
      fs.readFile(runtimeConfigPath, 'utf8', (error, configData) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Unable to read runtime config file.');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(configData);
      });
      return;
    }

    const config = `window.ECOTRACKER_CONFIG = Object.freeze({
  SUPABASE_URL: "${envSupabaseUrl}",
  SUPABASE_ANON_KEY: "${envSupabaseAnonKey}",
});`;

    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(config);
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${__dirname}`);
  if (sanitizeConfigValue(process.env.SUPABASE_URL)) {
    console.log(`✅ Supabase configured`);
  } else {
    console.log(`⚠️  Supabase not configured from env. Falling back to src/config/runtime-config.js`);
  }
});
