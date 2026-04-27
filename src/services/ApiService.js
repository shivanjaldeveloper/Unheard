// services/ApiService.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://unheardapi.primeapps.co.in/api/chat';

// Static API bearer — same one used across the whole app
const API_BEARER = 'Bearer Y7N7Mh9Z7ZLeMSYspeVwdXJ2Ky2LXc';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Reads the user token saved by VerifyOtpScreen:
 *   AsyncStorage.setItem('authToken', data.token)
 */
const getUserToken = async () => {
  const token = await AsyncStorage.getItem('authToken');
  console.log('[ApiService] authToken from storage:', token);
  if (!token) throw new Error('No auth token found. Please log in again.');
  return token;
};

export const ApiService = {
  /**
   * Step 1 — Create a new chat session.
   * POST /chatnew?token=<userToken>
   */
  createChat: async () => {
    const token = await getUserToken();
    const url = `${BASE_URL}/chatnew?token=${encodeURIComponent(token)}`;
    console.log('[createChat] POST', url);

    const response = await axios.post(url, null, {
      headers: { Authorization: API_BEARER },
    });
    console.log(
      '[createChat] Response:',
      JSON.stringify(response.data, null, 2),
    );

    const { status, chatid } = response.data;
    if (status !== 'success' || !chatid) {
      throw new Error('Failed to create chat session.');
    }
    return chatid;
  },

  /**
   * Step 2 — Start the chat with mood + prompt.
   * POST /chatstart?token=<userToken>&chatid=...&mood=...&prompt=...
   */
  startChat: async ({ chatid, mood, prompt }) => {
    const token = await getUserToken();
    const url =
      `${BASE_URL}/chatstart` +
      `?token=${encodeURIComponent(token)}` +
      `&chatid=${encodeURIComponent(chatid)}` +
      `&mood=${encodeURIComponent(mood)}` +
      `&prompt=${encodeURIComponent(prompt)}`;
    console.log('[startChat] POST', url);

    const response = await axios.post(url, null, {
      headers: { Authorization: API_BEARER },
    });
    console.log(
      '[startChat] Response:',
      JSON.stringify(response.data, null, 2),
    );

    const { status, chatid: returnedChatId, title, reply } = response.data;
    if (status !== 'success') {
      throw new Error('Failed to start chat session.');
    }
    return { chatid: returnedChatId, title, reply };
  },

  /**
   * Step 3 — Send a follow-up message in an existing chat.
   * POST /chatsendmessage?token=<userToken>&chatid=...&message=...
   * Returns the AI reply string.
   */
  sendMessage: async ({ chatid, message }) => {
    const token = await getUserToken();
    const url =
      `${BASE_URL}/chatsendmessage` +
      `?token=${encodeURIComponent(token)}` +
      `&chatid=${encodeURIComponent(chatid)}` +
      `&message=${encodeURIComponent(message)}`;
    console.log('[sendMessage] POST', url);

    const response = await axios.post(url, null, {
      headers: { Authorization: API_BEARER },
    });
    console.log(
      '[sendMessage] Response:',
      JSON.stringify(response.data, null, 2),
    );

    const { status, reply } = response.data;
    if (status !== 'success' || !reply) {
      throw new Error('Failed to get reply.');
    }
    return reply; // plain string
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
