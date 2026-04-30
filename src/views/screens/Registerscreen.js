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
} from 'react-native';
import { ScreenWrapper } from '../components';
import { SPACING } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this endpoint to match your actual register/profile API
const API_BASE = 'https://unheardapi.primeapps.co.in/api';
const API_TOKEN = 'Bearer Y7N7Mh9Z7ZLeMSYspeVwdXJ2Ky2LXc';

export default function RegisterScreen({ navigation, route }) {
  const { token, mobile, profileId } = route.params;

  const [form, setForm] = useState({
    username: '',
    email: '',
    fullname: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.fullname.trim()) errs.fullname = 'Full name is required';
    if (!form.username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username.trim())) {
      errs.username = '3–20 chars, letters, numbers, underscores only';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Update profile — adjust endpoint/body to match your backend
      const res = await fetch(`${API_BASE}/profile/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileid: profileId,
          mobile,
          fullname: form.fullname.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
        }),
      });

      // Save updated info locally regardless (in case backend differs)
      const existingProfile = JSON.parse(
        (await AsyncStorage.getItem('userProfile')) || '{}',
      );
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify({
          ...existingProfile,
          fullname: form.fullname.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
        }),
      );

      navigation.replace('EmotionalEntry', { token, profileId });
    } catch (e) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    field,
    placeholder,
    keyboardType,
    autoCapitalize,
    returnKeyType,
    ref: fieldRef,
    onSubmitEditing,
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputWrap,
          focusedField === field && styles.inputWrapFocused,
          errors[field] && styles.inputWrapError,
        ]}
      >
        <TextInput
          ref={fieldRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(196,181,253,0.3)"
          value={form[field]}
          onChangeText={t => {
            setForm(f => ({ ...f, [field]: t }));
            if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
          }}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'words'}
          returnKeyType={returnKeyType || 'next'}
          onSubmitEditing={onSubmitEditing}
          selectionColor="#a78bfa"
          autoCorrect={false}
        />
      </Animated.View>
      {errors[field] ? (
        <Text style={styles.fieldError}>{errors[field]}</Text>
      ) : null}
    </View>
  );

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
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>✨</Text>
              </View>
              <Text style={styles.title}>One last step</Text>
              <Text style={styles.subtitle}>
                Tell us a little about yourself{'\n'}to get started
              </Text>
              <View style={styles.mobileBadge}>
                <Text style={styles.mobileBadgeText}>+91 {mobile}</Text>
              </View>
            </View>

            {/* Form */}
            <Field
              label="Full name"
              field="fullname"
              placeholder="How should we call you?"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
            />

            <Field
              label="Username"
              field="username"
              placeholder="e.g. quiet_thinker"
              autoCapitalize="none"
              keyboardType="default"
              returnKeyType="next"
              ref={usernameRef}
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <Field
              label="Email"
              field="email"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              ref={emailRef}
              onSubmitEditing={handleSubmit}
            />

            {errors.general ? (
              <Text style={styles.generalError}>{errors.general}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1e1b4b" />
              ) : (
                <Text style={styles.buttonText}>Start my journey →</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              Your details are private and never shared
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
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
    marginBottom: 16,
  },
  mobileBadge: {
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  mobileBadgeText: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fieldWrap: { marginBottom: 18 },
  label: {
    color: 'rgba(196,181,253,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrap: {
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.18)',
  },
  inputWrapFocused: {
    borderColor: '#a78bfa',
    backgroundColor: 'rgba(167,139,250,0.1)',
  },
  inputWrapError: {
    borderColor: 'rgba(248,113,113,0.5)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#f5f3ff',
    fontSize: 16,
    fontWeight: '400',
  },
  fieldError: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  generalError: {
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
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#1e1b4b',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privacyNote: {
    color: 'rgba(196,181,253,0.35)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
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
