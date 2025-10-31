import { z } from 'zod';
import { requestOpenRouter } from '../services/openrouterClient.js';

export const WEB_SEARCH_TOOL_NAME = 'web_search';

export const webSearchInputSchema = z
  .object({
    query: z
      .string()
      .min(1, 'query must be a non-empty string')
      .describe('The search query string to search for on the web'),
  })
  .strict();

export const webSearchMetadata = {
  title: 'Web Search',
  description:
    "Perform a web search via OpenRouter's web plugin. API key, model, and proxy settings are provided via request headers (Authorization, X-Model, X-HTTP-Proxy, X-HTTPS-Proxy).",
  inputSchema: webSearchInputSchema.shape,
};

export function registerWebSearchTool(server) {
  server.registerTool(WEB_SEARCH_TOOL_NAME, webSearchMetadata, async (rawInput) => {
    const input = webSearchInputSchema.parse(rawInput);
    return requestOpenRouter(input);
  });
}
