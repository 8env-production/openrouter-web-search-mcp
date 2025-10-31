import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_CONFIG } from "./config/server.js";
import { registerWebSearchTool } from "./tools/webSearch.js";

async function startServer() {
  const server = new McpServer(SERVER_CONFIG);

  registerWebSearchTool(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exitCode = 1;
});
