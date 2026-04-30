// screens/EmotionalEntryScreen.js

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useEmotionalEntryViewModel } from '../../viewmodels';
import {
  ScreenWrapper,
  BackButton,
  PrimaryButton,
  EmotionCard,
} from '../components';
import { COLORS, SPACING, RADIUS } from '../../theme';
import { ApiService } from '../../services/ApiService';

export default function EmotionalEntryScreen({ navigation }) {
  const vm = useEmotionalEntryViewModel(navigation);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const emotionAnims = useRef(
    vm.emotions.map(() => new Animated.Value(0)),
  ).current;
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.stagger(
        80,
        emotionAnims.map(a =>
          Animated.spring(a, {
            toValue: 1,
            tension: 65,
            friction: 8,
            useNativeDriver: true,
          }),
        ),
      ).start(() => {
        Animated.spring(inputAnim, {
          toValue: 1,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const canContinue = !!vm.selectedEmotion && vm.inputText.trim().length > 0;

  const handleContinue = async () => {
    if (!canContinue || isLoading) return;
    setIsLoading(true);
    try {
      const chatid = await ApiService.createChat();
      const selectedEmotionObj = vm.emotions.find(
        e => e.id === vm.selectedEmotion,
      );
      const mood = selectedEmotionObj?.label ?? vm.selectedEmotion ?? 'unknown';
      const { reply, title } = await ApiService.startChat({
        chatid,
        mood,
        prompt: vm.inputText.trim(),
      });
      navigation.navigate('Chat', {
        chatid,
        emotion: mood,
        initialUserMessage: vm.inputText.trim(),
        initialAssistantReply: reply,
        chatTitle: title,
      });
    } catch (error) {
      console.error('[EmotionalEntry] flow error:', error);
      Alert.alert(
        'Something went wrong',
        error?.message || 'Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Row: Back (left) + History (right) ── */}
          <View style={styles.topRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <TouchableOpacity
              style={styles.historyBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('ChatHistory')}
            >
              <Text style={styles.historyIcon}>🕘</Text>
              <Text style={styles.historyLabel}>History</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: SPACING.md }} />

          <Animated.Text
            style={[
              styles.heading,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            How are you feeling{'\n'}right now?
          </Animated.Text>

          <Animated.Text style={[styles.subheading, { opacity: fadeAnim }]}>
            No right or wrong answer. Just pick what feels closest.
          </Animated.Text>

          {/* ── Emotion Cards ── */}
          <View style={styles.emotionGrid}>
            {vm.emotions.map((emotion, index) => (
              <EmotionCard
                key={emotion.id}
                emotion={emotion}
                isSelected={vm.selectedEmotion === emotion.id}
                onPress={() => vm.handleSelectEmotion(emotion.id)}
                animValue={emotionAnims[index]}
              />
            ))}
          </View>

          {/* ── Text Input ── */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                opacity: inputAnim,
                transform: [
                  {
                    translateY: inputAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind? (required)"
              placeholderTextColor="rgba(167,139,250,0.4)"
              value={vm.inputText}
              onChangeText={vm.setInputText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* ── Continue Button / Loader ── */}
          <Animated.View
            style={{ opacity: inputAnim, width: '100%', alignItems: 'center' }}
          >
            {isLoading ? (
              <ActivityIndicator
                color={COLORS.primary ?? '#a78bfa'}
                size="large"
                style={styles.loader}
              />
            ) : (
              <PrimaryButton
                label="Continue →"
                onPress={handleContinue}
                disabled={!canContinue}
              />
            )}
          </Animated.View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },

  // ── Top row ──────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.lg,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.3)',
    backgroundColor: 'rgba(167,139,250,0.08)',
  },
  historyIcon: { fontSize: 14 },
  historyLabel: {
    color: 'rgba(196,181,253,0.85)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  heading: {
    fontFamily: 'Georgia',
    fontSize: 30,
    color: '#f5f3ff',
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subheading: {
    fontSize: 14,
    color: 'rgba(196,181,253,0.55)',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 20,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: { width: '100%', marginBottom: 28 },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    padding: 18,
    color: '#f5f3ff',
    fontSize: 15,
    minHeight: 110,
    lineHeight: 23,
  },
  loader: { marginVertical: 16 },
});
