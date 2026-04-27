import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../components';
import { SPACING } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://unheardapi.primeapps.co.in/api/auth';
const API_TOKEN = 'Bearer Y7N7Mh9Z7ZLeMSYspeVwdXJ2Ky2LXc';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen({ navigation, route }) {
  const { mobile, transaction } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resending, setResending] = useState(false);

  const inputRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleVerify(otp);
    }
  }, [otp]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Accept currentOtp as param so useEffect always passes the latest value
  const handleVerify = async currentOtp => {
    const otpToVerify = currentOtp || otp;
    if (loading || otpToVerify.length < OTP_LENGTH) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/verifyotp?mobile=${mobile}&transaction=${transaction}&otp=${otpToVerify}`,
        {
          method: 'POST',
          headers: { Authorization: API_TOKEN },
        },
      );
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('mobile', data.mobile);
        await AsyncStorage.setItem('profileId', data.profileid);
        await AsyncStorage.setItem('userProfile', JSON.stringify(data));

        Animated.spring(successAnim, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          if (data.isprofilenew === 'yes') {
            navigation.replace('Register', {
              token: data.token,
              mobile: data.mobile,
              profileId: data.profileid,
            });
          } else {
            navigation.replace('EmotionalEntry', {
              token: data.token,
              profileId: data.profileid,
            });
          }
        }, 600);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp('');
        shake();
        // Re-focus after a tick — keeps keyboard alive
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await fetch(`${API_BASE}/requestotp?mobile=${mobile}`, {
        method: 'POST',
        headers: { Authorization: API_TOKEN },
      });
      setResendCooldown(30);
      setOtp('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      setError('Could not resend OTP. Try again.');
    } finally {
      setResending(false);
    }
  };

  const renderBoxes = () =>
    Array.from({ length: OTP_LENGTH }).map((_, i) => {
      const char = otp[i] || '';
      const isCurrent = i === otp.length && !loading;
      const isFilled = i < otp.length;
      const hasError = !!error && isFilled;

      return (
        <Animated.View
          key={i}
          style={[
            styles.otpBox,
            isFilled && styles.otpBoxFilled,
            isCurrent && styles.otpBoxActive,
            hasError && styles.otpBoxError,
            {
              transform: [
                { translateX: shakeAnim },
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.08, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.otpChar, isFilled && styles.otpCharFilled]}>
            {char}
          </Text>
          {isCurrent && !loading && <View style={styles.cursor} />}
        </Animated.View>
      );
    });

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.mobileText}>+91 {mobile}</Text>
            </Text>
          </View>

          {/*
            Hidden TextInput — the actual keyboard input source.
            Never unmounts, never blurs on submit.
            keyboardShouldPersistTaps="handled" on the ScrollView ensures
            taps on OTP boxes reach the TouchableOpacity without the scroll
            view swallowing them (which would dismiss the keyboard).
          */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={t => {
              setError('');
              setOtp(t.replace(/\D/g, '').slice(0, OTP_LENGTH));
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus
            caretHidden
            blurOnSubmit={false}
            showSoftInputOnFocus
          />

          {/* Tapping anywhere on OTP area keeps focus on hidden input */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.otpTouchArea}
          >
            <Animated.View style={styles.otpRow}>{renderBoxes()}</Animated.View>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              (loading || otp.length < OTP_LENGTH) && styles.buttonDisabled,
            ]}
            onPress={() => handleVerify(otp)}
            activeOpacity={0.8}
            disabled={loading || otp.length < OTP_LENGTH}
          >
            {loading ? (
              <ActivityIndicator color="#1e1b4b" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive it? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendCooldown > 0 || resending}
            >
              <Text
                style={[
                  styles.resendAction,
                  resendCooldown > 0 && styles.resendDisabled,
                ]}
              >
                {resending
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerHint}>
            No account needed · Always private
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 40,
  },
  backBtn: { marginBottom: 32 },
  backText: { color: 'rgba(167,139,250,0.7)', fontSize: 15, fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.08)',
    marginBottom: 20,
  },
  icon: { fontSize: 30 },
  title: {
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f3ff',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(221,214,254,0.65)',
    textAlign: 'center',
    lineHeight: 22,
  },
  mobileText: { color: '#a78bfa', fontWeight: '600' },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: 0,
    left: 0,
  },
  otpTouchArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.2)',
    backgroundColor: 'rgba(167,139,250,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: 'rgba(167,139,250,0.5)',
    backgroundColor: 'rgba(167,139,250,0.12)',
  },
  otpBoxActive: {
    borderColor: '#a78bfa',
    backgroundColor: 'rgba(167,139,250,0.15)',
  },
  otpBoxError: {
    borderColor: 'rgba(248,113,113,0.6)',
    backgroundColor: 'rgba(248,113,113,0.08)',
  },
  otpChar: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(196,181,253,0.4)',
  },
  otpCharFilled: { color: '#f5f3ff' },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 22,
    backgroundColor: '#a78bfa',
    borderRadius: 1,
    opacity: 0.9,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#a78bfa',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: {
    color: '#1e1b4b',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendLabel: { color: 'rgba(196,181,253,0.5)', fontSize: 13 },
  resendAction: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  resendDisabled: { color: 'rgba(167,139,250,0.4)' },
  footerHint: {
    color: 'rgba(196,181,253,0.45)',
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: 40,
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
});
