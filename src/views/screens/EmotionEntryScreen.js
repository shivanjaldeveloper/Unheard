import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useEmotionalEntryViewModel } from '../../viewmodels';
import {
  ScreenWrapper,
  BackButton,
  PrimaryButton,
  EmotionCard,
} from '../components';
import { COLORS, SPACING, RADIUS } from '../../theme';

export default function EmotionalEntryScreen({ navigation }) {
  const vm = useEmotionalEntryViewModel(navigation);

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

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton onPress={() => navigation.goBack()} />
          <View style={{ height: SPACING.lg }} />

          <Animated.Text
            style={[
              styles.heading,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            How are you feeling{'\n'}right now?
          </Animated.Text>

          <Animated.Text style={[styles.subheading, { opacity: fadeAnim }]}>
            No right or wrong answer. Just pick what feels closest.
          </Animated.Text>

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
              placeholder="What's on your mind? (optional)"
              placeholderTextColor="rgba(167,139,250,0.4)"
              value={vm.inputText}
              onChangeText={vm.setInputText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Animated.View>

          <Animated.View
            style={{ opacity: inputAnim, width: '100%', alignItems: 'center' }}
          >
            <PrimaryButton
              label="Continue →"
              onPress={vm.handleContinue}
              disabled={!vm.canContinue}
            />
          </Animated.View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 64,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
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
});
