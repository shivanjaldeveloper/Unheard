// screens/ChatHistoryScreen.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ScreenWrapper, BackButton } from '../components';
import { COLORS, SPACING, RADIUS } from '../../theme';
import { ApiService } from '../../services/ApiService';

// ── Emotion → emoji map ──────────────────────────────────────────────────────
const EMOTION_EMOJI = {
  Stressed: '😰',
  low: '😔',
  okay: '😊',
  unknown: '💬',
};

const getEmoji = mood => {
  if (!mood) return '💬';
  return EMOTION_EMOJI[mood.toLowerCase()] ?? '💬';
};

// ── Date helpers ─────────────────────────────────────────────────────────────
const formatRelative = rawDate => {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    const now = new Date();
    const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (days === 0)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return rawDate;
  }
};

const formatFull = rawDate => {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    return (
      d.toLocaleDateString([], {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return rawDate;
  }
};

// ── Chat Card ────────────────────────────────────────────────────────────────
function ChatCard({ item, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 55,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 9,
        delay: index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rawDate = item.createdat || item.created_at || item.date;
  const emoji = getEmoji(item.mood);
  const timeLabel = formatRelative(rawDate);
  const fullDate = formatFull(rawDate);
  const title = item.title || item.chattitle || 'Untitled Session';
  const moodLabel = item.mood
    ? item.mood.charAt(0).toUpperCase() + item.mood.slice(1)
    : null;
  const msgCount = item.messagecount || item.message_count || null;

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => onPress(item)}
      >
        {/* Emoji avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.chipRow}>
            {moodLabel && (
              <View style={styles.moodChip}>
                <Text style={styles.moodChipText}>{moodLabel}</Text>
              </View>
            )}
            {msgCount != null && (
              <Text style={styles.msgCount}>{msgCount} messages</Text>
            )}
          </View>

          <Text style={styles.fullDate}>{fullDate}</Text>
        </View>

        {/* Right */}
        <View style={styles.cardRight}>
          <Text style={styles.relTime}>{timeLabel}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.center}>
      <Text style={styles.stateEmoji}>📭</Text>
      <Text style={styles.stateTitle}>No chats yet</Text>
      <Text style={styles.stateSub}>
        Your past sessions will appear here once you start chatting.
      </Text>
    </View>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Text style={styles.stateEmoji}>⚠️</Text>
      <Text style={styles.stateTitle}>Couldn't load history</Text>
      <Text style={styles.stateSub}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ChatHistoryScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;

  const fetchChats = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getChatList();
      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.createdat || a.created_at || 0);
        const db = new Date(b.createdat || b.created_at || 0);
        return db - da; // newest first
      });
      setChats(sorted);
    } catch (err) {
      console.error('[ChatHistory] fetch error:', err);
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    fetchChats();
  }, []);

  const handlePress = item => {
    navigation.navigate('Chat', {
      chatid: item.chatid || item.id,
      emotion: item.mood,
      chatTitle: item.title || item.chattitle,
      isHistory: true,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────
  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Loading your sessions…</Text>
        </View>
      );
    }
    if (error)
      return <ErrorState message={error} onRetry={() => fetchChats()} />;
    if (chats.length === 0) return <EmptyState />;

    return (
      <FlatList
        data={chats}
        keyExtractor={(item, i) => String(item.chatid || item.id || i)}
        renderItem={({ item, index }) => (
          <ChatCard item={item} index={index} onPress={handlePress} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchChats(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chat History</Text>
          {chats.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chats.length}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 60 }} />
      </Animated.View>

      {renderBody()}
    </ScreenWrapper>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167,139,250,0.1)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f3ff',
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
  },

  // List
  list: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.12)',
    padding: SPACING.md,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 22 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: {
    color: '#f5f3ff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  moodChip: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  moodChipText: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '600',
  },
  msgCount: {
    color: 'rgba(196,181,253,0.45)',
    fontSize: 11,
  },
  fullDate: {
    color: 'rgba(196,181,253,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingTop: 2,
  },
  relTime: {
    color: 'rgba(196,181,253,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  chevron: {
    color: 'rgba(167,139,250,0.4)',
    fontSize: 22,
    lineHeight: 26,
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: 10,
  },
  loadingText: {
    color: 'rgba(196,181,253,0.45)',
    fontSize: 14,
    marginTop: 8,
  },
  stateEmoji: { fontSize: 52, marginBottom: 4 },
  stateTitle: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: '#f5f3ff',
    textAlign: 'center',
  },
  stateSub: {
    fontSize: 14,
    color: 'rgba(196,181,253,0.5)',
    textAlign: 'center',
    lineHeight: 21,
  },
  retryBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.4)',
    backgroundColor: 'rgba(167,139,250,0.1)',
  },
  retryText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
  },
});
