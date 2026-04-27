import React, { useRef, useState } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ScreenWrapper } from '../components';
import { SPACING } from '../../theme';

const API_BASE = 'https://unheardapi.primeapps.co.in/api/auth';
const API_TOKEN = 'Bearer Y7N7Mh9Z7ZLeMSYspeVwdXJ2Ky2LXc';

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(1)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFocus = () => {
    Animated.spring(inputScale, {
      toValue: 1.02,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(inputScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleRequestOtp = async () => {
    setError('');
    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      shake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requestotp?mobile=${mobile}`, {
        method: 'POST',
        headers: { Authorization: API_TOKEN },
      });
      const data = await res.json();

      if (res.ok) {
        navigation.navigate('VerifyOtp', {
          mobile,
          transaction: data.transaction || data.transactionId || '',
        });
      } else {
        setError(data.message || 'Failed to send OTP. Try again.');
        shake();
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
      shake();
    } finally {
      setLoading(false);
    }
  };

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Dismiss keyboard only when tapping outside inputs */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Text style={styles.logoEmoji}>🌊</Text>
              </View>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number{'\n'}to continue
            </Text>
          </View>

          {/* Input Area */}
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                transform: [{ translateX: shakeAnim }, { scale: inputScale }],
              },
            ]}
          >
            <View style={styles.prefixBox}>
              <Text style={styles.prefix}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mobile number"
              placeholderTextColor="rgba(196,181,253,0.35)"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={t => {
                setMobile(t);
                setError('');
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              returnKeyType="done"
              onSubmitEditing={handleRequestOtp}
              selectionColor="#a78bfa"
              // Critical: prevent keyboard from dismissing on submit
              blurOnSubmit={false}
            />
          </Animated.View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              (loading || mobile.length !== 10) && styles.buttonDisabled,
            ]}
            onPress={handleRequestOtp}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1e1b4b" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            We'll send a one-time password to verify your number
          </Text>

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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: 'rgba(167,139,250,0.2)',
    backgroundColor: 'rgba(167,139,250,0.06)',
  },
  prefix: {
    color: 'rgba(196,181,253,0.8)',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    color: '#f5f3ff',
    fontSize: 18,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#a78bfa',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#1e1b4b',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hint: {
    color: 'rgba(196,181,253,0.4)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
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
