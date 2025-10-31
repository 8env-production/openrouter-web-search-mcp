import axios from "axios";
import {
  OPENROUTER_API_URL,
  createPayload,
  createRequestConfig,
} from "../config/openrouter.js";

export async function requestOpenRouter(input) {
  const { query, ...overrides } = input;

  const payload = createPayload(query, overrides);
  const config = createRequestConfig(overrides);

  const response = await axios.post(OPENROUTER_API_URL, payload, config);
  const data = response.data;

  const assistantMessage =
    JSON.stringify(data?.choices?.[0]?.message) ?? "No response";

  return {
    content: [
      {
        type: "text",
        text: assistantMessage,
      },
    ],
    structuredContent: { result: assistantMessage },
  };
}
