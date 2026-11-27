import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import handler from './api/personalizar-menu.js'

function apiMiddlewarePlugin() {
  return {
    name: 'api-personalizar-menu-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/personalizar-menu')) {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch (e) {
              req.body = body;
            }
            try {
              await handler(req, res);
            } catch (err) {
              console.error('Error en middleware /api/personalizar-menu:', err);
              if (!res.writableEnded) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Error procesando la solicitud en el servidor.' }));
              }
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddlewarePlugin()],
})

