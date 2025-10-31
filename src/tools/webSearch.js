import { z } from 'zod';
import { requestOpenRouter } from '../services/openrouterClient.js';

export const WEB_SEARCH_TOOL_NAME = 'web_search';

export const webSearchInputSchema = z
  .object({
    query: z.string().min(1, 'query must be a non-empty string'),
    httpProxy: z.string().min(1).optional(),
    httpsProxy: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    pluginId: z.string().min(1).optional(),
    timeoutMs: z.number().int().positive().optional(),
    maxRedirects: z.number().int().nonnegative().optional(),
  })
  .strict();

export const webSearchMetadata = {
  title: 'Web Search',
  description:
    "Perform a web search via OpenRouter's web plugin. API key is provided via Authorization header. Supports per-request overrides for proxy and transport options.",
  inputSchema: webSearchInputSchema.shape,
};

export function registerWebSearchTool(server) {
  server.registerTool(WEB_SEARCH_TOOL_NAME, webSearchMetadata, async (rawInput) => {
    const input = webSearchInputSchema.parse(rawInput);
    return requestOpenRouter(input);
  });
}
