// services/ApiService.js
// Replace mock functions with real API calls from your backend developer

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  // ── Send message to AI ──────────────────────────────────────────────────────
  sendMessage: async ({ message, emotion, sessionId }) => {
    await delay(1500); // Remove this line when connecting real API
    // TODO: Replace with real API call
    // const response = await fetch('YOUR_API_URL/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message, emotion, sessionId }),
    // });
    // return await response.json();
    return {
      id: Date.now().toString(),
      text: 'I hear you. That sounds really heavy. Do you want to tell me more about what happened?',
    };
  },

  // ── Find human counselor ────────────────────────────────────────────────────
  findCounselor: async ({ filter }) => {
    await delay(3000);
    // TODO: Replace with real API call
    return {
      counselorId: 'c001',
      name: 'Support Specialist',
      waitTime: '~5 min',
    };
  },

  // ── Save session ────────────────────────────────────────────────────────────
  saveSession: async session => {
    await delay(500);
    // TODO: Replace with real API call
    return { success: true };
  },

  // ── Save memory consent ─────────────────────────────────────────────────────
  saveMemoryConsent: async ({ consent }) => {
    await delay(300);
    // TODO: Replace with real API call
    return { success: true };
  },
};
