import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const isProduction = process.env.NODE_ENV === 'production';
  let vite: any = null;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  // Explicit route handler for admin paths - guarantees index.html is always served
  // with no 404 regardless of headers or browser/webview user agents
  const adminRoutes = [
    '/admin',
    '/admin/*',
    '/admin-dashboard',
    '/admin-dashboard/*',
    '/admin-portal',
    '/admin-portal/*',
    '/dashboard',
    '/dashboard/*'
  ];

  app.get(adminRoutes, async (req, res, next) => {
    try {
      if (isProduction) {
        return res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      } else {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      }
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  if (!isProduction) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  // GitHub API Proxy
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // owner/repo

  app.post('/api/github/update', async (req, res) => {
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return res.status(500).json({ error: 'GitHub config missing' });
    }
    const { content, message } = req.body;
    
    try {
      // 1. Get SHA of existing file
      const { data: fileData } = await axios.get(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/products.json`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );

      // 2. Update file
      await axios.put(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/products.json`,
        {
          message: message || 'Update products',
          content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
          sha: fileData.sha
        },
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/github/products', async (req, res) => {
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return res.status(500).json({ error: 'GitHub config missing' });
    }
    try {
      const { data } = await axios.get(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/products.json`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3.raw' } }
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SPA fallback for all routes including /admin, /admin-dashboard, etc.
  // Guarantees no 404 on direct browser navigation or refresh
  app.get('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    try {
      if (isProduction) {
        return res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      } else {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      }
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(3000, () => console.log('Server running on port 3000'));
}

startServer();
