import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { BottomNav } from '../../components/BottomNav';
import { PostCard, Post } from '../../components/cards/PostCard';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

type TabType = 'myPosts' | 'saved';

// Mocks kept for now as requested
const MOCK_MY_POSTS: Post[] = [
  {
    id: '1',
    authorName: 'John Michael Pestaño',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Event',
    title: 'Lorem Ipsum Dolor Sit Amet',
    description: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
];

const MOCK_SAVED_POSTS: Post[] = [
  {
    id: '2',
    authorName: 'First Last',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Study',
    title: 'Lorem Ipsum Dolor Sit Amet',
    description: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { session } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('myPosts');

  // Dynamic Profile State
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [initials, setInitials] = useState('??');
  const [loading, setLoading] = useState(true);

  // Fetch Profile Data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfile = async () => {
        if (!session?.user) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, program')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (isActive && data) {
            const fullName = data.full_name || 'Anonymous Student';
            setName(fullName);
            setProgram(data.program || 'No Program Selected');

            // Calculate Initials
            const derivedInitials = fullName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();
            setInitials(derivedInitials);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchProfile();

      return () => {
        isActive = false;
      };
    }, [session])
  );

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

  const handlePostPress = (post: Post) => {
    console.log('Post pressed:', post.id);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const postsToDisplay = activeTab === 'myPosts' ? MOCK_MY_POSTS : MOCK_SAVED_POSTS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7} onPress={handleSettingsPress}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textLight} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </LinearGradient>
            <View style={styles.onlineBadge} />
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
          ) : (
            <>
              {/* Dynamic Name */}
              <Text style={styles.userName}>{name}</Text>
              {/* Dynamic Program */}
              <Text style={styles.userBio}>{program}</Text>
            </>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>POSTS CREATED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>FAVORS COMPLETED</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myPosts' && styles.tabActive]}
            onPress={() => setActiveTab('myPosts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'myPosts' && styles.tabTextActive]}>
              My Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts List */}
        <View style={styles.postsContainer}>
          {postsToDisplay.map((post) => (
            <PostCard key={post.id} post={post} onPress={() => handlePostPress(post)} />
          ))}
        </View>
      </ScrollView>

      <BottomNav selected="profile" onNavigate={handleNavigate} onCreatePost={handleCreatePost} />
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
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  profileSection: {
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.backgroundLight,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  postsContainer: {
    padding: 18,
  },
});