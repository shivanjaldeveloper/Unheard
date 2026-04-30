import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useVoiceViewModel,
  useHumanEscalationViewModel,
  useMatchingViewModel,
  useSessionEndViewModel,
  useReflectionViewModel,
  useMemoryConsentViewModel,
  useHomeViewModel,
  useSubscriptionViewModel,
} from '../../viewmodels';
import {
  ScreenWrapper,
  PrimaryButton,
  GhostButton,
  MessageBubble,
} from '../components';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { MATCHING_FILTERS, REFLECTION_OPTIONS, PLANS } from '../../models';

// ─── VoiceScreen ──────────────────────────────────────────────────────────────
export function VoiceScreen({ navigation }) {
  const { isPaused, handlePause, handleEnd } = useVoiceViewModel(navigation);
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse2Anim, {
          toValue: 1.55,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(pulse2Anim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0f0c29', '#1a1728', '#0f0c29']}
      style={styles.fullscreen}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={[styles.voice_center, { paddingTop: insets.top }]}>
        <Animated.View
          style={[styles.voice_ring2, { transform: [{ scale: pulse2Anim }] }]}
        />
        <Animated.View
          style={[styles.voice_ring1, { transform: [{ scale: pulseAnim }] }]}
        />
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.voice_circle}
        >
          <Text style={{ fontSize: 36 }}>🎙️</Text>
        </LinearGradient>
        <Text style={styles.voice_status}>
          {isPaused ? 'Paused' : 'Listening...'}
        </Text>
      </View>
      {/* paddingBottom uses insets.bottom so buttons never hide behind
          the gesture bar (Moto Edge 60 Pro) or nav buttons (Redmi A4) */}
      <View
        style={[
          styles.voice_btns,
          { paddingBottom: Math.max(insets.bottom + SPACING.md, SPACING.xl) },
        ]}
      >
        <TouchableOpacity
          onPress={handlePause}
          style={styles.voice_pauseBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.voice_pauseText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEnd}
          style={styles.voice_endBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.voice_endText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// ─── HumanEscalationScreen ────────────────────────────────────────────────────
export function HumanEscalationScreen({ navigation }) {
  const { handleTalkNow, handleSchedule } =
    useHumanEscalationViewModel(navigation);
  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.center_screen}>
        <Text style={styles.big_emoji}>🧑‍💬</Text>
        <Text style={styles.screen_title}>Talk to a real person</Text>
        <Text style={styles.screen_sub}>
          Connect with a trained support specialist
        </Text>
        <View style={styles.info_card}>
          <View style={styles.info_row}>
            <Text style={styles.info_label}>⏱ Estimated wait</Text>
            <Text style={styles.info_value}>~5 min</Text>
          </View>
          <View style={[styles.info_row, { borderBottomWidth: 0 }]}>
            <Text style={styles.info_label}>💳 Per session</Text>
            <Text style={styles.info_value}>₹299</Text>
          </View>
        </View>
        <PrimaryButton
          label="Talk Now"
          onPress={handleTalkNow}
          style={{ marginBottom: 12 }}
        />
        <GhostButton label="Schedule for Later" onPress={handleSchedule} />
      </View>
    </ScreenWrapper>
  );
}

// ─── MatchingScreen ───────────────────────────────────────────────────────────
export function MatchingScreen({ navigation }) {
  const { selectedFilter, handleFilterSelect, handleFound } =
    useMatchingViewModel(navigation);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
    const t = setTimeout(handleFound, 4000);
    return () => clearTimeout(t);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.center_screen}>
        <Animated.View
          style={[styles.spinner, { transform: [{ rotate: spin }] }]}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.spinnerInner}
          />
        </Animated.View>
        <Text style={styles.screen_title}>
          Finding someone{'\n'}to talk to...
        </Text>
        <Text style={styles.screen_sub}>Matching based on your needs</Text>
        <View style={styles.filter_row}>
          {MATCHING_FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              onPress={() => handleFilterSelect(f.id)}
              style={[
                styles.filter_chip,
                selectedFilter === f.id && styles.filter_chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.filter_text,
                  selectedFilter === f.id && { color: '#fff' },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── HumanChatScreen ──────────────────────────────────────────────────────────
export function HumanChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'human',
      text: "Hi, I'm here to listen. What's on your mind?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: inputText.trim() },
    ]);
    setInputText('');
  };

  return (
    <LinearGradient
      colors={COLORS.darkBackgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullscreen}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        style={styles.fullscreen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header uses insets.top so it clears the status bar on all devices */}
        <View style={[styles.chat_header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10 }}
          >
            <Text style={{ color: 'rgba(167,139,250,0.7)', fontSize: 22 }}>
              ←
            </Text>
          </TouchableOpacity>
          <View style={styles.human_badge}>
            <Text style={styles.human_badge_text}>
              🟢 You are talking to a real person
            </Text>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isUser={item.role === 'user'} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
        {/* Input bar clears nav bar / gesture bar via insets.bottom */}
        <View
          style={[
            styles.shared_inputBar,
            { paddingBottom: Math.max(insets.bottom, 8) },
          ]}
        >
          <TextInput
            style={styles.shared_textInput}
            placeholder="Say anything..."
            placeholderTextColor="rgba(167,139,250,0.35)"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            style={[
              styles.shared_sendBtn,
              !inputText.trim() && { opacity: 0.4 },
            ]}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.shared_sendGradient}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                ↑
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─── SessionEndScreen ─────────────────────────────────────────────────────────
export function SessionEndScreen({ navigation }) {
  const { handleContinue, handleEnd } = useSessionEndViewModel(navigation);
  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.center_screen}>
        <Text style={styles.big_emoji}>🌿</Text>
        <Text style={styles.screen_title}>Take a moment</Text>
        <Text style={styles.screen_sub}>
          Would you like to continue or take a break?
        </Text>
        <View style={{ height: SPACING.xl }} />
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          style={{ marginBottom: 14 }}
        />
        <GhostButton label="End Session" onPress={handleEnd} />
      </View>
    </ScreenWrapper>
  );
}

// ─── ReflectionScreen ─────────────────────────────────────────────────────────
export function ReflectionScreen({ navigation }) {
  const { selected, handleSelect } = useReflectionViewModel(navigation);
  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.center_screen}>
        <Text style={styles.screen_title}>How do you feel now?</Text>
        <Text style={styles.screen_sub}>
          Your honest answer helps us improve
        </Text>
        <View style={{ height: SPACING.xl }} />
        {REFLECTION_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => handleSelect(opt.id)}
            activeOpacity={0.8}
            style={[
              styles.reflection_opt,
              selected === opt.id && styles.reflection_optSelected,
            ]}
          >
            <Text style={{ fontSize: 24 }}>{opt.emoji}</Text>
            <Text
              style={[
                styles.reflection_label,
                selected === opt.id && { color: '#fff' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

// ─── MemoryConsentScreen ──────────────────────────────────────────────────────
export function MemoryConsentScreen({ navigation }) {
  const { handleYes, handleNo } = useMemoryConsentViewModel(navigation);
  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.center_screen}>
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.consent_icon}
        >
          <Text style={{ fontSize: 28 }}>🧠</Text>
        </LinearGradient>
        <Text style={styles.screen_title}>Remember this?</Text>
        <Text style={styles.screen_sub}>
          Can we remember this session for next time to give you a more personal
          experience?
        </Text>
        <View style={styles.consent_card}>
          <Text style={styles.consent_note}>
            Your data is always private and never sold.
          </Text>
        </View>
        <View style={{ height: SPACING.xl }} />
        <PrimaryButton
          label="Yes, remember"
          onPress={handleYes}
          style={{ marginBottom: 14 }}
        />
        <GhostButton label="No thanks" onPress={handleNo} />
      </View>
    </ScreenWrapper>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export function HomeScreen({ navigation }) {
  const { handleStart, handleSubscription } = useHomeViewModel(navigation);
  // ScreenWrapper applies insets.top/bottom via safeContent padding.
  // We add extra top padding for the greeting row so it doesn't crowd
  // the status bar on either device.
  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.home_container}>
        <View style={styles.home_top}>
          <Text style={styles.home_greeting}>Good to see you 👋</Text>
          <TouchableOpacity onPress={handleSubscription}>
            <Text style={styles.home_plans_link}>Plans</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.home_center}>
          <View style={styles.home_logo_ring}>
            <View style={styles.home_logo_inner}>
              <Text style={{ fontSize: 36 }}>🌊</Text>
            </View>
          </View>
          <Text style={styles.home_title}>Unheard</Text>
          <Text style={styles.home_sub}>Ready when you are</Text>
          <View style={{ height: SPACING.xl }} />
          <PrimaryButton label="Start Talking" onPress={handleStart} />
        </View>
        <View style={styles.snippet_card}>
          <Text style={styles.snippet_label}>Last session</Text>
          <Text style={styles.snippet_text}>
            "I talked about feeling overwhelmed at work..."
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── SubscriptionScreen ───────────────────────────────────────────────────────
export function SubscriptionScreen({ navigation }) {
  const { handleSelectPlan } = useSubscriptionViewModel(navigation);
  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        contentContainerStyle={styles.sub_scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ alignSelf: 'flex-start', marginBottom: SPACING.lg }}
        >
          <Text
            style={{
              color: 'rgba(167,139,250,0.65)',
              fontSize: 15,
              fontWeight: '500',
            }}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={styles.screen_title}>Choose your plan</Text>
        <Text style={styles.screen_sub}>Upgrade anytime. Cancel anytime.</Text>
        <View style={{ height: SPACING.lg }} />
        {PLANS.map(plan => (
          <View
            key={plan.id}
            style={[styles.plan_card, plan.highlighted && styles.plan_cardHL]}
          >
            {plan.highlighted && (
              <View style={styles.plan_badge}>
                <Text style={styles.plan_badge_text}>Most Popular</Text>
              </View>
            )}
            <Text
              style={[
                styles.plan_name,
                plan.highlighted && { color: COLORS.primary },
              ]}
            >
              {plan.name}
            </Text>
            <Text style={styles.plan_price}>{plan.price}</Text>
            <View style={{ height: SPACING.sm }} />
            {plan.features.map((f, i) => (
              <Text key={i} style={styles.plan_feature}>
                ✓ {f}
              </Text>
            ))}
            <View style={{ height: SPACING.md }} />
            <TouchableOpacity
              onPress={() => handleSelectPlan(plan.id)}
              activeOpacity={0.85}
            >
              {plan.highlighted ? (
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.plan_cta_gradient}
                >
                  <Text
                    style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}
                  >
                    {plan.cta}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.plan_cta_ghost}>
                  <Text style={styles.plan_cta_ghost_text}>{plan.cta}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  fullscreen: { flex: 1 },

  // Voice
  voice_center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voice_ring1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryDeep,
    opacity: 0.25,
  },
  voice_ring2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryDeep,
    opacity: 0.12,
  },
  voice_circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.primary,
  },
  voice_status: {
    color: 'rgba(221,214,254,0.8)',
    fontSize: 18,
    marginTop: SPACING.xl,
    letterSpacing: 1,
  },
  voice_btns: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  voice_pauseBtn: {
    flex: 1,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  voice_pauseText: { color: '#f5f3ff', fontSize: 15, fontWeight: '600' },
  voice_endBtn: {
    flex: 1,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
  },
  voice_endText: { color: '#FCA5A5', fontSize: 15, fontWeight: '600' },

  // Center layout — no hardcoded padding, ScreenWrapper.safeContent handles insets
  center_screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  big_emoji: { fontSize: 52, marginBottom: SPACING.md },
  screen_title: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f3ff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 38,
  },
  screen_sub: {
    fontSize: 15,
    color: 'rgba(196,181,253,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Info card (Escalation)
  info_card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
  },
  info_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167,139,250,0.1)',
  },
  info_label: { color: 'rgba(196,181,253,0.7)', fontSize: 14 },
  info_value: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  // Matching
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  spinnerInner: { flex: 1 },
  filter_row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  filter_chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  filter_chipSelected: {
    backgroundColor: COLORS.primaryDeep,
    borderColor: COLORS.primaryDeep,
  },
  filter_text: {
    color: 'rgba(221,214,254,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },

  // Human Chat header — paddingTop is applied inline via insets
  chat_header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167,139,250,0.1)',
  },
  human_badge: {
    flex: 1,
    backgroundColor: 'rgba(5,150,105,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.25)',
  },
  human_badge_text: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Shared input — paddingBottom applied inline via insets
  shared_inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(167,139,250,0.1)',
    gap: 8,
  },
  shared_textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f5f3ff',
    fontSize: 15,
    lineHeight: 21,
  },
  shared_sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  shared_sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Reflection
  reflection_opt: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
    gap: 14,
  },
  reflection_optSelected: {
    backgroundColor: COLORS.primaryDeep,
    borderColor: COLORS.primaryDeep,
  },
  reflection_label: { fontSize: 16, fontWeight: '600', color: '#f5f3ff' },

  // Memory Consent
  consent_icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  consent_card: {
    width: '100%',
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
  },
  consent_note: {
    color: 'rgba(196,181,253,0.6)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Home — paddingTop: SPACING.lg gives breathing room below the status bar
  // (ScreenWrapper.safeContent already has paddingTop = insets.top)
  home_container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  home_top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  home_greeting: { fontSize: 17, fontWeight: '600', color: '#f5f3ff' },
  home_plans_link: { color: COLORS.primary, fontSize: 15, fontWeight: '500' },
  home_center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  home_logo_ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  home_logo_inner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  home_title: {
    fontFamily: 'Georgia',
    fontSize: 40,
    fontWeight: '700',
    color: '#f5f3ff',
    letterSpacing: 1,
  },
  home_sub: { fontSize: 15, color: 'rgba(196,181,253,0.55)', marginTop: 8 },
  snippet_card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
  },
  snippet_label: {
    fontSize: 11,
    color: 'rgba(167,139,250,0.5)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  snippet_text: {
    fontSize: 14,
    color: 'rgba(221,214,254,0.7)',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Subscription — safeContent handles top inset; extra paddingTop here gives space
  sub_scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  plan_card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
  },
  plan_cardHL: { borderColor: COLORS.primary, borderWidth: 1.5 },
  plan_badge: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  plan_badge_text: { color: '#fff', fontSize: 11, fontWeight: '600' },
  plan_name: { fontSize: 20, fontWeight: '700', color: '#f5f3ff' },
  plan_price: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  plan_feature: {
    fontSize: 14,
    color: 'rgba(221,214,254,0.7)',
    marginTop: 6,
    lineHeight: 20,
  },
  plan_cta_gradient: {
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  plan_cta_ghost: {
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  plan_cta_ghost_text: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
