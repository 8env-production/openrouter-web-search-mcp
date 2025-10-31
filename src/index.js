import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { SERVER_CONFIG } from './config/server.js';
import { runWithRequestContext } from './context/requestContext.js';
import { registerWebSearchTool } from './tools/webSearch.js';

const PORT = process.env.PORT || 80;

async function startServer() {
  // Create an MCP server
  const server = new McpServer(SERVER_CONFIG);

  // Register the web search tool
  registerWebSearchTool(server);

  // Set up Express
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // MCP endpoint
  app.post('/mcp', async (req, res) => {
    // Извлекаем API key из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!apiKey) {
      return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    // Извлекаем дополнительные параметры из заголовков
    const httpProxy = req.headers['x-http-proxy'];
    const httpsProxy = req.headers['x-https-proxy'];
    const model = req.headers['x-model'];

    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      transport.close();
    });

    // Выполняем MCP handler в контексте с параметрами
    await runWithRequestContext(
      {
        openrouterApiKey: apiKey,
        httpProxy,
        httpsProxy,
        model,
      },
      async () => {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      }
    );
  });

  // Start the server
  app
    .listen(PORT, () => {
      console.log(`MCP server listening on port ${PORT}`);
      console.log(`Endpoint: http://localhost:${PORT}/mcp`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    })
    .on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
}

startServer().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exitCode = 1;
});
