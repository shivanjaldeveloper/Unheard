import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useWelcomeViewModel } from '../../viewmodels';
import { PrimaryButton, ScreenWrapper } from '../components';
import { COLORS, SPACING, SHADOWS } from '../../theme';

export default function WelcomeScreen({ navigation }) {
  const { handleStart } = useWelcomeViewModel(navigation);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(160, [
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(subtitleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const makeSlide = anim => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Blobs */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <View style={styles.center}>
        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoAnim,
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
              {
                translateY: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
            marginBottom: SPACING.xl,
          }}
        >
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoEmoji}>🌊</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, makeSlide(titleAnim)]}>
          Unheard
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, makeSlide(subtitleAnim)]}>
          Say what you couldn't{'\n'}say anywhere
        </Animated.Text>

        <Animated.View
          style={[
            { width: '100%', alignItems: 'center' },
            makeSlide(buttonAnim),
          ]}
        >
          <PrimaryButton label="Start Talking" onPress={handleStart} />
        </Animated.View>
      </View>

      <Animated.Text style={[styles.footerHint, { opacity: subtitleAnim }]}>
        No account needed · Always private
      </Animated.Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  blobTopLeft: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#6d28d9',
    opacity: 0.18,
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#2563eb',
    opacity: 0.14,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 34 },
  title: {
    fontFamily: 'Georgia',
    fontSize: 52,
    fontWeight: '700',
    color: '#f5f3ff',
    letterSpacing: 1.5,
    marginBottom: 14,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(221,214,254,0.75)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
    marginBottom: 52,
  },
  footerHint: {
    position: 'absolute',
    bottom: 44,
    alignSelf: 'center',
    color: 'rgba(196,181,253,0.45)',
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
