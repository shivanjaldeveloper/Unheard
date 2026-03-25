import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme';

// ─── Primary Button ───────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, disabled = false, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryBtn, disabled && styles.btnDisabled, style]}
    >
      <LinearGradient
        colors={disabled ? ['#3b3351', '#3b3351'] : COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtnGradient}
      >
        <Text style={[styles.primaryBtnText, disabled && { opacity: 0.45 }]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Ghost Button ─────────────────────────────────────────────────────────────
export function GhostButton({ label, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.ghostBtn, style]}
    >
      <Text style={styles.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────
export function BackButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>
  );
}

// ─── Dark Screen Wrapper ──────────────────────────────────────────────────────
export function ScreenWrapper({ children, style }) {
  return (
    <LinearGradient
      colors={COLORS.darkBackgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.screen, style]}
    >
      {children}
    </LinearGradient>
  );
}

// ─── Full Dark Screen Wrapper ─────────────────────────────────────────────────
export function DarkScreenWrapper({ children, style }) {
  return (
    <LinearGradient
      colors={['#0f0c29', '#1e1b2e', '#13111c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.screen, style]}
    >
      {children}
    </LinearGradient>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
export function MessageBubble({ message, isUser }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      tension: 65,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        },
      ]}
    >
      {!isUser && (
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.botAvatar}
        >
          <Text style={{ fontSize: 13 }}>🌊</Text>
        </LinearGradient>
      )}
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}
      >
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Typing Dots ──────────────────────────────────────────────────────────────
export function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const animate = () => {
      Animated.stagger(
        160,
        dots.map(dot =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
        ),
      ).start(() => animate());
    };
    animate();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(167,139,250,0.7)',
            opacity: dot,
            transform: [
              {
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

// ─── Prompt Chip ──────────────────────────────────────────────────────────────
export function PromptChip({ label, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.chip}
    >
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Emotion Card ─────────────────────────────────────────────────────────────
export function EmotionCard({ emotion, isSelected, onPress, animValue }) {
  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
        width: '47%',
        marginBottom: 12,
      }}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {isSelected ? (
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.emotionBtn, styles.emotionBtnSelected]}
          >
            <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
            <Text style={[styles.emotionLabel, { color: '#fff' }]}>
              {emotion.label}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.emotionBtn}>
            <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
            <Text
              style={[styles.emotionLabel, { color: 'rgba(221,214,254,0.7)' }]}
            >
              {emotion.label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  primaryBtn: {
    width: '80%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    alignSelf: 'center',
    ...SHADOWS.primary,
  },
  primaryBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.7 },
  ghostBtn: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24 },
  ghostBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '500' },
  backBtn: { alignSelf: 'flex-start' },
  backText: {
    color: 'rgba(167,139,250,0.65)',
    fontSize: 15,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowBot: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleBot: {
    backgroundColor: COLORS.bubbleBot,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: COLORS.bubbleUser,
    borderBottomRightRadius: 6,
  },
  bubbleText: { color: 'rgba(221,214,254,0.9)', fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
  emotionBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emotionBtnSelected: { borderColor: 'transparent', ...SHADOWS.primary },
  emotionEmoji: { fontSize: 28, marginBottom: 8 },
  emotionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
