import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function localLeadApiPlugin() {
  return {
    name: 'local-lead-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      if (env.BOT_TOKEN) process.env.BOT_TOKEN = env.BOT_TOKEN;
      if (env.CHAT_ID) process.env.CHAT_ID = env.CHAT_ID;

      server.middlewares.use('/api/lead', async (req, res) => {
        const handler = require('./api/lead.js');
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          req.body = Buffer.concat(chunks).toString('utf8');
          const wrappedRes = {
            statusCode: 200,
            setHeader: (k, v) => res.setHeader(k, v),
            status(code) {
              this.statusCode = code;
              return this;
            },
            json(data) {
              res.statusCode = this.statusCode;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
          };
          await handler(req, wrappedRes);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localLeadApiPlugin()],
});
