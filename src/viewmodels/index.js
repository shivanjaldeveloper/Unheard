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
export const useChatViewModel = (navigation, route) => {
  const { emotion, message: initialMessage } = route?.params || {};
  const sessionId = Date.now().toString();

  const [messages, setMessages] = useState([
    new Message({
      id: '0',
      role: 'bot',
      text: "I'm here. Take your time — you can say anything.",
    }),
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const sendMessage = useCallback(
    async (text = inputText) => {
      if (!text || !text.trim()) return;

      // 👉 EXACT LOGIC: add " a" at the end
      const finalText = text.trim() + ' a';

      const userMsg = new Message({
        id: Date.now().toString(),
        role: 'user',
        text: finalText,
      });

      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);

      try {
        const response = await ApiService.sendMessage({
          message: finalText, // 👈 IMPORTANT
          emotion,
          sessionId,
        });

        const botMsg = new Message({
          id: response.id,
          role: 'bot',
          text: response.text,
        });

        setMessages(prev => [...prev, botMsg]);
      } catch (e) {
        const errMsg = new Message({
          id: Date.now().toString(),
          role: 'bot',
          text: 'Sorry, something went wrong. Please try again.',
        });

        setMessages(prev => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, emotion, sessionId],
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
    initialMessage,
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

  const handleFound = useCallback(() => {
    navigation.navigate('HumanChat');
  }, [navigation]);

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
