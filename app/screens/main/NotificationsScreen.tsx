import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { BottomNav } from '../../components/BottomNav';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type NotificationsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Notifications'>;

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'announcement';
  created_at: string;
  title: string | null;
  content: string | null;
  is_read: boolean;
  actor?: {
    full_name: string | null;
  };
}

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { session } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to map DB types to UI Icons/Colors
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'like': return { icon: '💗', bg: '#FFE0F0', action: 'liked your post' };
      case 'comment': return { icon: '💬', bg: '#D1FAE5', action: 'commented on' };
      case 'follow': return { icon: '👤', bg: '#DBEAFE', action: 'started following you' };
      case 'event': return { icon: '📅', bg: '#E9D5FF', action: 'New Event:' };
      case 'announcement': return { icon: '📢', bg: '#FEF3C7', action: 'Announcement:' };
      default: return { icon: '🔔', bg: '#F3F4F6', action: 'notification' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();

      // Optional: Realtime Subscription could go here similar to Messages
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session?.user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel) };
    }, [session])
  );

  const handleMarkAllRead = async () => {
    if (!session?.user) return;
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      // Mark specific item as read locally and in DB
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
    }
    // Future: Navigate based on type (e.g. to PostDetails)
    console.log('Pressed notification:', notification.id);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNavigate = (item: 'home' | 'messages' | 'notifications' | 'profile') => {
    const routeMap = { home: 'Home', messages: 'Messages', notifications: 'Notifications', profile: 'Profile' } as const;
    navigation.navigate(routeMap[item]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity style={styles.markAllButton} activeOpacity={0.7} onPress={handleMarkAllRead}>
          <Text style={styles.markAllIcon}>✉️</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsContainer}
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: COLORS.textSecondary }}>No notifications yet.</Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const style = getNotificationStyle(notification.type);
            const actorName = notification.actor?.full_name || 'System';

            return (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationItem, !notification.is_read && { backgroundColor: '#F0F9FF' }]}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[styles.iconContainer, { backgroundColor: style.bg }]}>
                  <Text style={styles.notificationIcon}>{style.icon}</Text>
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>
                    <Text style={styles.userName}>{actorName}</Text>
                    <Text style={styles.action}> {style.action}</Text>
                    {notification.content && (
                      <Text style={styles.postTitle}> {notification.content}</Text>
                    )}
                  </Text>
                  <Text style={styles.timestamp}>{getTimeAgo(notification.created_at)}</Text>
                </View>

                {!notification.is_read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomNav selected="notifications" onNavigate={handleNavigate} onCreatePost={() => navigation.navigate('CreatePost')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  markAllButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllIcon: {
    fontSize: 22,
  },
  notificationsContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  notificationsContent: {
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 12,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userName: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  action: {
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  postTitle: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
});