import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  FlatList,
  ScrollView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useChatViewModel } from '../../viewmodels';
import {
  ScreenWrapper,
  MessageBubble,
  TypingDots,
  PromptChip,
  GhostButton,
} from '../components';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { PROMPT_CHIPS } from '../../models';

export default function ChatScreen({ navigation, route }) {
  const vm = useChatViewModel(navigation, route);
  const flatListRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    if (vm.initialMessage?.trim()) {
      setTimeout(() => vm.sendMessage(vm.initialMessage), 600);
    }
  }, []);

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={vm.messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isUser={item.role === 'user'} />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() =>
          vm.isTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <TypingDots />
              </View>
            </View>
          ) : null
        }
      />

      {/* Prompt Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {PROMPT_CHIPS.map(chip => (
          <PromptChip
            key={chip.id}
            label={chip.label}
            onPress={() => vm.handleChipPress(chip.label)}
          />
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Say anything..."
          placeholderTextColor="rgba(167,139,250,0.35)"
          value={vm.inputText}
          onChangeText={vm.setInputText}
          multiline
          maxHeight={100}
          onSubmitEditing={() => vm.sendMessage()}
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
          onPress={() => vm.sendMessage()}
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

      {/* Voice Modal */}
      <Modal visible={vm.showVoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
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
  chipsRow: { maxHeight: 48, marginBottom: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    paddingBottom: 16,
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
