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
  Alert,
  Platform,
  UIManager,
  LayoutAnimation
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons'; 

import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';
import { Post } from '../../components/cards/PostCard';
import { Avatar } from '../../components/Avatar';
import { UserProfileModal } from '../../components/modals/UserProfileModal';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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

  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // --- Menu State ---
  // We only track the ID of the currently open menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'like': return { icon: '❤️', bg: '#FFE0F0', action: 'liked your post.' };
      case 'comment': return { icon: '💬', bg: '#D1FAE5', action: 'commented:' };
      case 'follow': return { icon: null, bg: 'transparent', action: 'started following you.' };
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

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          created_at,
          user_id,
          actor_id,
          type,
          title,
          content,
          is_read,
          resource_id,
          actor:profiles!notifications_actor_id_fkey (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications: Notification[] = (data || [])
        .map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          user_id: item.user_id,
          actor_id: item.actor_id,
          type: item.type,
          title: item.title,
          content: item.content,
          is_read: item.is_read,
          resource_id: item.resource_id,
          actor: Array.isArray(item.actor) ? item.actor[0] : item.actor
        }))
        .filter(n => {
            if (['like', 'comment', 'event'].includes(n.type) && !n.resource_id) {
                return false;
            }
            return true;
        });

      setNotifications(formattedNotifications);
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
          () => fetchNotifications()
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

  const handleNavigateToPost = async (resourceId: string) => {
    setNavigating(true);
    try {
        let { data: postData } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url),
                post_likes(count),
                comments(count)
            `)
            .eq('id', resourceId)
            .maybeSingle();

        if (!postData) {
             const { data: commentData } = await supabase
                .from('comments')
                .select('post_id')
                .eq('id', resourceId)
                .maybeSingle();
             
             if (commentData?.post_id) {
                 const { data: retryPostData } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles:user_id (full_name, avatar_url),
                        post_likes(count),
                        comments(count)
                    `)
                    .eq('id', commentData.post_id)
                    .maybeSingle();
                 postData = retryPostData;
             }
        }

        if (!postData) {
            Alert.alert("Content Unavailable", "This content may have been deleted.");
            return;
        }

        const getProfile = (data: any) => {
            if (!data?.profiles) return null;
            return Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
        };
        
        const authorProfile = getProfile(postData);
        const authorName = authorProfile?.full_name || 'Unknown User';

        const formattedPost: Post = {
            id: postData.id,
            userId: postData.user_id,
            authorName: authorName,
            authorInitials: getInitials(authorName),
            authorAvatarUrl: authorProfile?.avatar_url || null,
            timestamp: new Date(postData.created_at).toLocaleDateString(),
            label: postData.category ? postData.category.charAt(0).toUpperCase() + postData.category.slice(1) : 'General',
            title: postData.title,
            description: postData.description,
            category: postData.category,
            fileUrl: postData.file_url,
            fileType: postData.file_type,
            fileName: postData.file_name,
            likesCount: postData.post_likes?.[0]?.count || 0,
            commentsCount: postData.comments?.[0]?.count || 0,
        };

        navigation.navigate('PostDetails', { post: formattedPost });

    } catch (err) {
        console.error("Navigation error:", err);
        Alert.alert("Error", "Could not load content.");
    } finally {
        setNavigating(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // If menu is open, just close it and don't navigate
    if (openMenuId === notification.id) {
      toggleMenu(notification.id);
      return;
    }
    // If another menu is open, close it
    if (openMenuId) {
      setOpenMenuId(null);
    }

    if (!notification.is_read) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      supabase.from('notifications').update({ is_read: true }).eq('id', notification.id).then();
    }

    if (notification.type === 'follow') {
        if (notification.actor_id) {
            setSelectedUserId(notification.actor_id);
            setUserModalVisible(true);
        }
    } else {
        if (notification.resource_id) {
            await handleNavigateToPost(notification.resource_id);
        }
    }
  };

  // --- Menu Handlers ---

  const toggleMenu = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenMenuId(prev => prev === id ? null : id);
  };

  const handleTurnOffNotification = () => {
    Alert.alert("Notifications", "You will no longer receive updates about this post.");
    setOpenMenuId(null);
  };

  const handleDeleteNotification = async (id: string) => {
    // Optimistic Update
    setOpenMenuId(null);
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton} activeOpacity={0.7} onPress={handleMarkAllRead}>
          <Text style={styles.markAllIcon}>✉️</Text>
        </TouchableOpacity>
      </View>

      {navigating && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      )}

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
            let displayContent = notification.content || '';
            const isMenuOpen = openMenuId === notification.id;

            if (notification.type === 'comment') {
                displayContent = displayContent.replace(/^Commented:\s*/i, '');
                displayContent = `"${displayContent}"`;
            } else if (notification.type === 'event') {
                displayContent = displayContent.replace(/^posted a new event:\s*/i, '');
                displayContent = `"${displayContent}"`;
            } else if (notification.type === 'like' || notification.type === 'follow') {
                if (displayContent.toLowerCase().includes('liked your post') || 
                    displayContent.toLowerCase().includes('started following')) {
                    displayContent = '';
                }
            }

            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                    styles.notificationItem, 
                    !notification.is_read && { backgroundColor: '#F0F9FF' },
                    { zIndex: isMenuOpen ? 1000 : 1 } // Ensure menu appears above next items
                ]}
                activeOpacity={0.9}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.leftContainer}>
                    {notification.type === 'follow' ? (
                        <View style={styles.avatarWrapper}>
                            <Avatar initials={initials} avatarUrl={notification.actor?.avatar_url} size="small" />
                            <View style={styles.followBadge}><Text style={{fontSize: 8}}>👤</Text></View>
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
                    {displayContent ? <Text style={styles.postTitle}> {displayContent}</Text> : null}
                  </Text>
                  <Text style={styles.timestamp}>{getTimeAgo(notification.created_at)}</Text>
                </View>

                {/* Right side actions */}
                <View style={styles.rightActionsContainer}>
                  {!notification.is_read && <View style={styles.unreadDot} />}
                  
                  <TouchableOpacity 
                    style={styles.moreButton} 
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent item press
                        toggleMenu(notification.id);
                    }}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  >
                     <Feather name="more-horizontal" size={20} color={COLORS.textTertiary} />
                  </TouchableOpacity>

                  {/* Minimalist Dropdown Menu */}
                  {isMenuOpen && (
                    <View style={styles.inlineMenu}>
                        <TouchableOpacity 
                            style={styles.inlineMenuItem} 
                            onPress={(e) => { e.stopPropagation(); handleTurnOffNotification(); }}
                        >
                            <Feather name="bell-off" size={14} color={COLORS.textPrimary} />
                            <Text style={styles.inlineMenuText}>Turn off</Text>
                        </TouchableOpacity>
                        <View style={styles.inlineMenuDivider} />
                        <TouchableOpacity 
                            style={styles.inlineMenuItem} 
                            onPress={(e) => { e.stopPropagation(); handleDeleteNotification(notification.id); }}
                        >
                            <Feather name="trash-2" size={14} color="#EF4444" />
                            <Text style={[styles.inlineMenuText, { color: '#EF4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: COLORS.backgroundLight, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  markAllButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  markAllIcon: { fontSize: 22 },
  notificationsContainer: { flex: 1, backgroundColor: COLORS.backgroundLight },
  notificationsContent: { paddingBottom: 30 },
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.backgroundLight },
  leftContainer: { marginRight: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarWrapper: { position: 'relative', padding: 4 },
  followBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#DBEAFE', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFF' },
  notificationIcon: { fontSize: 24 },
  notificationContent: { flex: 1, paddingRight: 8, justifyContent: 'center', minHeight: 48 },
  notificationText: { fontSize: 15, lineHeight: 22, marginBottom: 4, flexWrap: 'wrap' },
  userName: { fontWeight: '700', color: COLORS.textPrimary },
  action: { fontWeight: '400', color: COLORS.textSecondary },
  postTitle: { fontWeight: '500', color: COLORS.textPrimary, fontStyle: 'italic' },
  timestamp: { fontSize: 13, color: COLORS.textTertiary, marginTop: 2 },
  
  // Right Actions & Menu
  rightActionsContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingTop: 4,
    position: 'relative', // Context for absolute menu
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  moreButton: {
    padding: 4,
  },
  
  // Minimalist Popup Menu
  inlineMenu: {
    position: 'absolute',
    top: 25, 
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
    minWidth: 110,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inlineMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  inlineMenuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  inlineMenuText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary
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