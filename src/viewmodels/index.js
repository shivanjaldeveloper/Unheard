// viewmodels/index.js — All ViewModels as custom hooks

import { useState, useCallback } from 'react';
import { Message, Session, EMOTIONS } from '../models';
import { ApiService } from '../services/ApiService';

// ─── Welcome ViewModel ────────────────────────────────────────────────────────
export const useWelcomeViewModel = navigation => {
  const handleStart = useCallback(() => {
    navigation.navigate('EmotionalEntry');
  }, [navigation]);

  return { handleStart };
};

// ─── Emotional Entry ViewModel ────────────────────────────────────────────────
export const useEmotionalEntryViewModel = navigation => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [inputText, setInputText] = useState('');

  const canContinue = selectedEmotion !== null || inputText.trim().length > 0;

  const handleSelectEmotion = useCallback(id => {
    setSelectedEmotion(prev => (prev === id ? null : id));
  }, []);

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    navigation.navigate('Chat', {
      emotion: selectedEmotion,
      message: inputText,
    });
  }, [canContinue, selectedEmotion, inputText, navigation]);

  return {
    selectedEmotion,
    inputText,
    setInputText,
    canContinue,
    handleSelectEmotion,
    handleContinue,
    emotions: EMOTIONS,
  };
};

// ─── Chat ViewModel ───────────────────────────────────────────────────────────
/**
 * options.chatid       — the chat session id from createChat API
 * options.emotion      — mood string
 * options.seedMessages — array of { id, role, text } to pre-populate the chat
 *                        role must be 'user' or 'assistant'
 */
export const useChatViewModel = (navigation, route, options = {}) => {
  const { chatid, emotion, seedMessages = [] } = options;

  // ── Build the initial messages list from seedMessages ──────────────────────
  // If seedMessages were provided (coming from EmotionalEntryScreen), use them.
  // Otherwise fall back to the old static greeting so other entry points still work.
  const buildInitialMessages = () => {
    if (seedMessages.length > 0) {
      return seedMessages.map(
        m =>
          new Message({
            id: m.id ?? Date.now().toString() + Math.random(),
            role: m.role, // 'user' or 'assistant'
            text: m.text,
          }),
      );
    }
    // Fallback static greeting (used if ChatScreen is opened without seed data)
    return [
      new Message({
        id: '0',
        role: 'assistant',
        text: "I'm here. Take your time — you can say anything.",
      }),
    ];
  };

  const [messages, setMessages] = useState(buildInitialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // ── Send follow-up messages ────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text = inputText) => {
      if (!text || !text.trim()) return;

      const trimmed = text.trim();

      // Add the user bubble immediately
      const userMsg = new Message({
        id: Date.now().toString(),
        role: 'user',
        text: trimmed,
      });
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);

      try {
        // Use ApiService.sendMessage with chatid + message
        const reply = await ApiService.sendMessage({
          chatid,
          message: trimmed,
        });

        const botMsg = new Message({
          id: Date.now().toString() + '-bot',
          role: 'assistant',
          text: reply, // ApiService.sendMessage returns the plain reply string
        });
        setMessages(prev => [...prev, botMsg]);
      } catch (e) {
        const errMsg = new Message({
          id: Date.now().toString() + '-err',
          role: 'assistant',
          text: 'Sorry, something went wrong. Please try again.',
        });
        setMessages(prev => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, chatid],
  );

  const handleChipPress = useCallback(chipLabel => {
    setInputText(chipLabel);
  }, []);

  const handleVoice = useCallback(() => setShowVoiceModal(true), []);
  const handleEndSession = useCallback(
    () => navigation.navigate('SessionEnd'),
    [navigation],
  );
  const handleHumanEscalation = useCallback(
    () => navigation.navigate('HumanEscalation'),
    [navigation],
  );

  return {
    emotion,
    messages,
    inputText,
    setInputText,
    isTyping,
    showVoiceModal,
    setShowVoiceModal,
    sendMessage,
    handleChipPress,
    handleVoice,
    handleEndSession,
    handleHumanEscalation,
  };
};

// ─── Voice ViewModel ──────────────────────────────────────────────────────────
export const useVoiceViewModel = navigation => {
  const [isPaused, setIsPaused] = useState(false);

  const handlePause = useCallback(() => setIsPaused(p => !p), []);
  const handleEnd = useCallback(
    () => navigation.navigate('SessionEnd'),
    [navigation],
  );

  return { isPaused, handlePause, handleEnd };
};

// ─── Matching ViewModel ───────────────────────────────────────────────────────
export const useMatchingViewModel = navigation => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isSearching, setIsSearching] = useState(true);

  const handleFilterSelect = useCallback(id => {
    setSelectedFilter(prev => (prev === id ? null : id));
  }, []);

  const handleFound = useCallback(
    () => navigation.navigate('HumanChat'),
    [navigation],
  );

  return { selectedFilter, isSearching, handleFilterSelect, handleFound };
};

// ─── Session End ViewModel ────────────────────────────────────────────────────
export const useSessionEndViewModel = navigation => {
  const handleContinue = useCallback(
    () => navigation.navigate('Chat'),
    [navigation],
  );
  const handleEnd = useCallback(
    () => navigation.navigate('Reflection'),
    [navigation],
  );

  return { handleContinue, handleEnd };
};

// ─── Reflection ViewModel ─────────────────────────────────────────────────────
export const useReflectionViewModel = navigation => {
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback(
    id => {
      setSelected(id);
      setTimeout(() => navigation.navigate('MemoryConsent'), 400);
    },
    [navigation],
  );

  return { selected, handleSelect };
};

// ─── Memory Consent ViewModel ─────────────────────────────────────────────────
export const useMemoryConsentViewModel = navigation => {
  const handleYes = useCallback(async () => {
    await ApiService.saveMemoryConsent({ consent: true });
    navigation.navigate('Home');
  }, [navigation]);

  const handleNo = useCallback(async () => {
    await ApiService.saveMemoryConsent({ consent: false });
    navigation.navigate('Home');
  }, [navigation]);

  return { handleYes, handleNo };
};

// ─── Human Escalation ViewModel ───────────────────────────────────────────────
export const useHumanEscalationViewModel = navigation => {
  const handleTalkNow = useCallback(
    () => navigation.navigate('Matching'),
    [navigation],
  );
  const handleSchedule = useCallback(
    () => navigation.navigate('Subscription'),
    [navigation],
  );

  return { handleTalkNow, handleSchedule };
};

// ─── Subscription ViewModel ───────────────────────────────────────────────────
export const useSubscriptionViewModel = navigation => {
  const handleSelectPlan = useCallback(
    planId => {
      // TODO: Handle payment
      navigation.navigate('Home');
    },
    [navigation],
  );

  return { handleSelectPlan };
};

// ─── Home ViewModel ───────────────────────────────────────────────────────────
export const useHomeViewModel = navigation => {
  const handleStart = useCallback(
    () => navigation.navigate('EmotionalEntry'),
    [navigation],
  );
  const handleSubscription = useCallback(
    () => navigation.navigate('Subscription'),
    [navigation],
  );

  return { handleStart, handleSubscription };
};
