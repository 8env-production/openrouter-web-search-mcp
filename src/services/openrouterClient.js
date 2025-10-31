import axios from 'axios';
import { createPayload, createRequestConfig, OPENROUTER_API_URL } from '../config/openrouter.js';

export async function requestOpenRouter(input) {
  const { query } = input;

  const payload = createPayload(query);
  const config = createRequestConfig();

  const response = await axios.post(OPENROUTER_API_URL, payload, config);
  const data = response.data;

  const assistantMessage = JSON.stringify(data?.choices?.[0]?.message) ?? 'No response';

  return {
    content: [
      {
        type: 'text',
        text: assistantMessage,
      },
    ],
    structuredContent: { result: assistantMessage },
  };
}
