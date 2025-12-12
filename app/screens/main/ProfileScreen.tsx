// app/screens/main/ProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons'; 
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { BottomNav } from '../../components/BottomNav';
import { PostCard, Post } from '../../components/cards/PostCard';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Profile } from '../../types';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabType = 'myPosts' | 'saved';

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { session, onlineUsers } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('myPosts');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initials, setInitials] = useState('??');
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // New states for followers
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Determine online status
  const isOnline = session?.user ? onlineUsers.has(session.user.id) : false;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        if (!session?.user) return;

        let fetchedProfile: Profile | null = null;
        let derivedInitials = '??';
        let derivedName = 'Anonymous Student';

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) console.error('Error fetching profile:', profileError);

          if (isActive && profileData) {
            fetchedProfile = profileData as Profile;
            setProfile(fetchedProfile);
            
            derivedName = fetchedProfile.full_name || 'Anonymous Student';
            derivedInitials = derivedName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            setInitials(derivedInitials);
          }

          // Fetch Followers/Following Counts
          // Followers: People where following_id = me
          const { count: followers } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', session.user.id);
            
          // Following: People where follower_id = me
          const { count: following } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', session.user.id);
          
          if (isActive) {
              setFollowersCount(followers || 0);
              setFollowingCount(following || 0);
          }

        } catch (err) {
          console.error('Profile fetch error:', err);
        } finally {
          if (isActive) setLoadingProfile(false);
        }

        if (isActive) setLoadingPosts(true);
        
        try {
          // Fetch My Posts with counts
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*, post_likes(count), comments(count)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          
          if (postsError) console.error('Error fetching posts:', postsError);

          if (isActive && postsData) {
             const formattedPosts: Post[] = postsData.map((item: any) => ({
                id: item.id,
                userId: item.user_id,
                authorName: derivedName, 
                authorInitials: derivedInitials,
                authorAvatarUrl: fetchedProfile?.avatar_url,
                timestamp: getRelativeTime(item.created_at),
                label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
                title: item.title,
                description: item.description,
                category: item.category,
                fileUrl: item.file_url,
                likesCount: item.post_likes?.[0]?.count || 0,
                commentsCount: item.comments?.[0]?.count || 0,
             }));
             setMyPosts(formattedPosts);
          }

          // Fetch Saved Posts
          const { data: savedData, error: savedError } = await supabase
            .from('saved_posts')
            .select(`
                post:posts!inner (
                    id, title, description, category, created_at, file_url, user_id,
                    profiles:profiles!posts_user_id_fkey (full_name, avatar_url),
                    post_likes(count),
                    comments(count)
                )
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

            if (savedError) console.error('Error fetching saved:', savedError);

            if (isActive && savedData) {
                const formattedSaved: Post[] = savedData.map((item: any) => {
                    const post = item.post;
                    const authorName = post.profiles?.full_name || 'Unknown';
                    const authorInitials = authorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    return {
                        id: post.id,
                        userId: post.user_id,
                        authorName: authorName,
                        authorInitials: authorInitials,
                        authorAvatarUrl: post.profiles?.avatar_url,
                        timestamp: getRelativeTime(post.created_at),
                        label: post.category.charAt(0).toUpperCase() + post.category.slice(1),
                        title: post.title,
                        description: post.description,
                        category: post.category,
                        fileUrl: post.file_url,
                        likesCount: post.post_likes?.[0]?.count || 0,
                        commentsCount: post.comments?.[0]?.count || 0,
                    };
                });
                setSavedPosts(formattedSaved);
            }

        } catch (err) {
            console.error(err);
        } finally {
            if (isActive) setLoadingPosts(false);
        }
      };

      fetchData();

      return () => { isActive = false; };
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
    navigation.navigate('PostDetails', { post });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const displayPosts = activeTab === 'myPosts' ? myPosts : savedPosts;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7} onPress={handleSettingsPress}>
          <Feather name="settings" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {loadingProfile ? (
              <View style={[styles.avatar, { backgroundColor: '#F3F4F6' }]}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : profile?.avatar_url ? (
              <View>
                <Image 
                  source={{ uri: profile.avatar_url }} 
                  style={styles.avatar} 
                />
                {isOnline && <View style={styles.onlineBadge} />}
              </View>
            ) : (
              <View>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
                {isOnline && <View style={styles.onlineBadge} />}
              </View>
            )}
          </View>

          {loadingProfile ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
          ) : (
            <>
              <Text style={styles.userName}>{profile?.full_name || 'Anonymous Student'}</Text>
              <Text style={styles.userBio}>{profile?.program || 'No Program Selected'}</Text>
            </>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{myPosts.length}</Text>
              <Text style={styles.statLabel}>POSTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>FOLLOWERS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>FOLLOWING</Text>
            </View>
          </View>
        </View>

        <View style={styles.stickyWrapper}>
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
        </View>

        <View style={styles.postsContainer}>
          {loadingPosts ? (
             <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : displayPosts.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 30 }}>
                <Text style={{ color: COLORS.textSecondary }}>
                    {activeTab === 'myPosts' ? 'No posts yet.' : 'No saved posts.'}
                </Text>
             </View>
          ) : (
            displayPosts.map((post) => (
                <PostCard key={post.id} post={post} onPress={() => handlePostPress(post)} />
            ))
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  profileSection: {
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    zIndex: 1,
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
    resizeMode: 'cover',
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
    justifyContent: 'space-between',
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
  },
  stickyWrapper: {
    backgroundColor: COLORS.backgroundLight,
    zIndex: 999,
    elevation: 999,
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 999,
      },
    }),
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
    gap: 16,
    zIndex: 1,
  },
});