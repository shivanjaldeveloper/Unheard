// screens/ChatScreen.js

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  FlatList,
  Modal,
  Keyboard,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useChatViewModel } from '../../viewmodels';
import {
  ScreenWrapper,
  MessageBubble,
  TypingDots,
  GhostButton,
} from '../components';
import { COLORS, SPACING, RADIUS } from '../../theme';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Keyboard height hook ──────────────────────────────────────────────────────
// iOS only — Android uses windowSoftInputMode="adjustResize" so the OS
// shrinks the window automatically and we never need a manual offset there.
function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const show = Keyboard.addListener('keyboardWillShow', e => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardHeight;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatScreen({ navigation, route }) {
  const { chatid, emotion, initialUserMessage, initialAssistantReply } =
    route.params ?? {};

  const seedMessages = [];
  if (initialUserMessage) {
    seedMessages.push({
      id: 'seed-user',
      role: 'user',
      text: initialUserMessage,
    });
  }
  if (initialAssistantReply) {
    seedMessages.push({
      id: 'seed-assistant',
      role: 'assistant',
      text: initialAssistantReply,
    });
  }

  const vm = useChatViewModel(navigation, route, {
    chatid,
    emotion,
    seedMessages,
  });

  const flatListRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight(); // 0 on Android always

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Read inputText at call time — avoids stale closure on Android (last char bug)
  const handleSend = useCallback(() => {
    if (vm.inputText.trim()) {
      vm.sendMessage();
    }
  }, [vm]);

  // ── Bottom padding calculation ─────────────────────────────────────────────
  // iOS  : when keyboard is up, pad by keyboard height (input rides just above it)
  //        when keyboard is down, pad by safe-area bottom (home indicator gap)
  // Android: always just safe-area bottom — OS handles the rest via adjustResize
  const safeBottom = Math.max(insets.bottom, 10);
  const inputBarBottom =
    Platform.OS === 'ios'
      ? keyboardHeight > 0
        ? keyboardHeight + 4
        : safeBottom
      : safeBottom;

  return (
    <View style={styles.root}>
      <ScreenWrapper style={{ flex: 1 }}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 10,
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.headerAvatar}
            >
              <Text style={{ fontSize: 14 }}>🌊</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Unheard</Text>
              <Text style={styles.headerStatus}>Listening</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={vm.handleHumanEscalation}
            style={styles.escalateBtn}
          >
            <Text style={styles.escalateText}>Talk to Human</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={vm.messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isUser={item.role === 'user'} />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          style={styles.flatList}
        />

        {/* ── Typing indicator ── */}
        {vm.isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
          </View>
        )}

        {/* ── Input Bar ── */}
        <View style={[styles.inputBar, { paddingBottom: inputBarBottom }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Say anything..."
            placeholderTextColor="rgba(167,139,250,0.35)"
            value={vm.inputText}
            onChangeText={vm.setInputText}
            multiline
            blurOnSubmit={false}
            returnKeyType="default"
          />
          <TouchableOpacity
            onPress={vm.handleVoice}
            style={styles.micBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.micIcon}>🎙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={!vm.inputText.trim()}
            onPress={handleSend}
            style={[
              styles.sendBtn,
              !vm.inputText.trim() && styles.sendBtnDisabled,
            ]}
          >
            <LinearGradient
              colors={
                vm.inputText.trim()
                  ? COLORS.primaryGradient
                  : ['#2a2540', '#2a2540']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtnGradient}
            >
              <Text style={styles.sendBtnIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Voice Modal ── */}
        <Modal visible={vm.showVoiceModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalSheet,
                { paddingBottom: insets.bottom + SPACING.xl },
              ]}
            >
              <Text style={styles.modalTitle}>Switch to Voice?</Text>
              <Text style={styles.modalSubtitle}>
                We can switch to voice if you prefer
              </Text>
              <View style={{ height: SPACING.lg }} />
              <GhostButton
                label="Try Voice"
                onPress={() => {
                  vm.setShowVoiceModal(false);
                  navigation.navigate('Voice');
                }}
              />
              <GhostButton
                label="Continue Chat"
                onPress={() => vm.setShowVoiceModal(false)}
              />
            </View>
          </View>
        </Modal>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167,139,250,0.1)',
  },
  backBtn: { padding: 4, marginRight: 10 },
  backText: { color: 'rgba(167,139,250,0.7)', fontSize: 22 },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#f5f3ff', fontSize: 15, fontWeight: '600' },
  headerStatus: { color: 'rgba(167,139,250,0.55)', fontSize: 11, marginTop: 1 },
  escalateBtn: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  escalateText: {
    color: 'rgba(196,181,253,0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  flatList: { flex: 1 },
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    paddingLeft: 46,
    marginTop: 4,
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.1)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(167,139,250,0.1)',
    gap: 8,
  },
  textInput: {
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
    maxHeight: 120,
  },
  micBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: { fontSize: 22 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sendBtnIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1e1b2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f3ff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: 'rgba(196,181,253,0.6)',
    textAlign: 'center',
  },
});
