// services/ApiService.js

import axios from 'axios';

const API_KEY =
  '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';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  sendMessage: async ({ message, emotion }) => {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3-8b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are an empathetic mental health listener. User emotion: ${
                emotion || 'unknown'
              }`,
            },
            {
              role: 'user',
              content: message,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost',
            'X-Title': 'Unheard App',
          },
        },
      );

      console.log('FULL RESPONSE:', JSON.stringify(response.data, null, 2));

      const aiText =
        response?.data?.choices?.[0]?.message?.content ||
        response?.data?.choices?.[0]?.text ||
        "I'm here with you. Tell me more.";

      return {
        id: Date.now().toString(),
        text: aiText,
      };
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error.message ||
        'Unknown error';

      console.log('ERROR FULL:', JSON.stringify(error, null, 2));

      return {
        id: Date.now().toString(),
        text: `ERROR: ${errorMsg}`, // 👈 show real error in chat
      };
    }
  },

  findCounselor: async ({ filter }) => {
    await delay(1000);
    return {
      counselorId: 'c001',
      name: 'Support Specialist',
      waitTime: '~5 min',
    };
  },

  saveSession: async session => {
    await delay(500);
    return { success: true };
  },

  saveMemoryConsent: async ({ consent }) => {
    await delay(300);
    return { success: true };
  },
};
