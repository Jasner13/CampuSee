import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types'; // Only import Notification from here
import { Post } from '../../components/cards/PostCard'; // Import Post from the component to match UI shape
import { Avatar } from '../../components/Avatar';
import { UserProfileModal } from '../../components/modals/UserProfileModal';

type NotificationsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Notifications'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { session } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);

  // Modal State for User Profiles
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // --- Helper: Get Initials ---
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // --- Helper: UI Configuration ---
  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'like': return { icon: '❤️', bg: '#FFE0F0', action: 'liked your post' };
      case 'comment': return { icon: '💬', bg: '#D1FAE5', action: 'commented on' };
      case 'follow': return { icon: null, bg: 'transparent', action: 'started following you' }; // Icon handled by Avatar
      case 'event': return { icon: '📅', bg: '#E9D5FF', action: 'posted a new event:' };
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

  // --- Fetch Logic ---
  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (full_name, avatar_url)
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

      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session?.user.id}` },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel) };
    }, [session])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!session?.user) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id);
  };

  // --- Interaction Logic ---

  const handleNavigateToPost = async (postId: string) => {
    setNavigating(true);
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:profiles!posts_user_id_fkey (full_name, avatar_url),
                post_likes(count),
                comments(count)
            `)
            .eq('id', postId)
            .single();

        if (error || !data) {
            Alert.alert("Error", "This post is no longer available.");
            return;
        }

        const formattedPost: Post = {
            id: data.id,
            userId: data.user_id,
            authorName: data.profiles?.full_name || 'Unknown User',
            authorInitials: getInitials(data.profiles?.full_name),
            authorAvatarUrl: data.profiles?.avatar_url,
            timestamp: new Date(data.created_at).toLocaleDateString(),
            label: data.category,
            title: data.title,
            description: data.description,
            category: data.category,
            fileUrl: data.file_url,
            fileType: data.file_type,
            fileName: data.file_name,
            likesCount: data.post_likes?.[0]?.count || 0,
            commentsCount: data.comments?.[0]?.count || 0,
        };

        navigation.navigate('PostDetails', { post: formattedPost });

    } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not load post.");
    } finally {
        setNavigating(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 1. Mark as read immediately in UI
    if (!notification.is_read) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      // Fire and forget update
      supabase.from('notifications').update({ is_read: true }).eq('id', notification.id).then();
    }

    // 2. Handle Navigation based on Type
    if (notification.type === 'follow') {
        if (notification.actor_id) {
            setSelectedUserId(notification.actor_id);
            setUserModalVisible(true);
        }
    } else if (['like', 'comment', 'event'].includes(notification.type)) {
        if (notification.resource_id) {
            await handleNavigateToPost(notification.resource_id);
        } else {
            Alert.alert("Notice", "Content not available.");
        }
    }
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

      {/* Loading Overlay for Navigation */}
      {navigating && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      )}

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
            const config = getNotificationConfig(notification.type);
            const actorName = notification.actor?.full_name || 'System';
            const initials = getInitials(actorName);

            return (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationItem, !notification.is_read && { backgroundColor: '#F0F9FF' }]}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}
              >
                {/* Logic: If 'follow', show Avatar. Else show Icon circle */}
                <View style={styles.leftContainer}>
                    {notification.type === 'follow' ? (
                        <View style={styles.avatarWrapper}>
                            <Avatar 
                                initials={initials} 
                                avatarUrl={notification.actor?.avatar_url} 
                                size="small" 
                            />
                            {/* Tiny overlay icon to indicate it's a follow (optional polish) */}
                            <View style={styles.followBadge}>
                                <Text style={{fontSize: 8}}>👤</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                            <Text style={styles.notificationIcon}>{config.icon}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>
                    <Text style={styles.userName}>{actorName}</Text>
                    <Text style={styles.action}> {config.action}</Text>
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

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal 
            visible={userModalVisible}
            onClose={() => setUserModalVisible(false)}
            userId={selectedUserId}
        />
      )}
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
    paddingBottom: 30,
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
  leftContainer: {
      marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
      position: 'relative',
      padding: 4, // Align visual size with icon container
  },
  followBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#DBEAFE',
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FFF'
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
    minHeight: 48, // Match icon height for alignment
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
  loadingOverlay: {
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 50,
  }
});