import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { BottomNav } from '../../components/BottomNav';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

type NotificationsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Notifications'>;

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'announcement';
  icon: string;
  iconBg: string;
  userName: string;
  action: string;
  postTitle?: string;
  timestamp: string;
  isUnread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    icon: '💗',
    iconBg: '#FFE0F0',
    userName: 'Sarah Martinez',
    action: 'liked your post',
    postTitle: '"Study Group Calculus II"',
    timestamp: '2m ago',
    isUnread: true,
  },
  {
    id: '2',
    type: 'comment',
    icon: '💬',
    iconBg: '#D1FAE5',
    userName: 'Alex Chen',
    action: 'commented on',
    postTitle: '"Looking for Chemistry Lab Partner"',
    timestamp: '15m ago',
    isUnread: true,
  },
  {
    id: '3',
    type: 'follow',
    icon: '👤',
    iconBg: '#DBEAFE',
    userName: 'Maya Patel',
    action: 'started following you',
    timestamp: '1h ago',
    isUnread: false,
  },
  {
    id: '4',
    type: 'event',
    icon: '📅',
    iconBg: '#E9D5FF',
    userName: 'Campus Events',
    action: 'new event:',
    postTitle: '"Career Fair - Engineering Students"',
    timestamp: '2h ago',
    isUnread: false,
  },
  {
    id: '5',
    type: 'like',
    icon: '💗',
    iconBg: '#FFE0F0',
    userName: 'Jordan Kim',
    action: 'and 3 others liked your post',
    postTitle: '"Free Textbooks Available"',
    timestamp: '4h ago',
    isUnread: false,
  },
  {
    id: '6',
    type: 'announcement',
    icon: '📅',
    iconBg: '#E9D5FF',
    userName: 'Academic Office',
    action: 'posted an announcement:',
    postTitle: '"Final Exam Schedule Released"',
    timestamp: '6h ago',
    isUnread: true,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();

  const handleNavigate = (item: 'home' | 'messages' | 'notifications' | 'profile') => {
    const routeMap = {
      home: 'Home',
      messages: 'Messages',
      notifications: 'Notifications',
      profile: 'Profile',
    } as const;

    navigation.navigate(routeMap[item]);
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleNotificationPress = (notification: Notification) => {
    console.log('Notification pressed:', notification.id);
  };

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
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
      >
        {MOCK_NOTIFICATIONS.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={styles.notificationItem}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={[styles.iconContainer, { backgroundColor: notification.iconBg }]}>
              <Text style={styles.notificationIcon}>{notification.icon}</Text>
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>
                <Text style={styles.userName}>{notification.userName}</Text>
                <Text style={styles.action}> {notification.action}</Text>
                {notification.postTitle && (
                  <Text style={styles.postTitle}> {notification.postTitle}</Text>
                )}
              </Text>
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            </View>

            {notification.isUnread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav selected="notifications" onNavigate={handleNavigate} onCreatePost={handleCreatePost} />
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