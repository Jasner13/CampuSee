import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator, 
  DeviceEventEmitter,
  Image,
  FlatList, // <--- Added
  ListRenderItem // <--- Added
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { SearchBar } from '../../components/SearchBar';
import { CategoryChip } from '../../components/CategoryChip';
import { PostCard, Post } from '../../components/cards/PostCard';
import { BottomNav } from '../../components/BottomNav';
import { UserProfileModal } from '../../components/modals/UserProfileModal';
import { SharePostModal } from '../../components/modals/SharePostModal';
import { PostLikesModal } from '../../components/modals/PostLikesModal';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { CATEGORIES, CategoryType } from '../../constants/categories';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type HomeFeedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PAGE_SIZE = 10; // <--- Pagination Size

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

const getInitials = (name: string | null) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<HomeFeedScreenNavigationProp>();
  const { profile, refreshProfile } = useAuth(); 

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // <--- New State
  
  // Pagination State
  const [page, setPage] = useState(0); // <--- New State
  const [hasMore, setHasMore] = useState(true); // <--- New State

  // Modal States
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  
  const [selectedPostToShare, setSelectedPostToShare] = useState<Post | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Likes Modal State
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [selectedPostIdForLikes, setSelectedPostIdForLikes] = useState<string | null>(null);

  const fetchPosts = async (pageNumber = 0, shouldRefresh = false) => {
    // Only show full screen loader on initial load (page 0) and not refreshing
    if (pageNumber === 0 && !shouldRefresh) setLoading(true);
    if (pageNumber > 0) setLoadingMore(true);

    try {
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Includes counts for likes and comments
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles!posts_user_id_fkey (full_name, avatar_url),
          post_likes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(from, to); // <--- Implement Pagination

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchText.trim()) {
        query = query.ilike('title', `%${searchText}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      if (data) {
        const formattedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          authorName: item.profiles?.full_name || 'Unknown User',
          authorInitials: getInitials(item.profiles?.full_name || null),
          authorAvatarUrl: item.profiles?.avatar_url,
          timestamp: getRelativeTime(item.created_at),
          label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          title: item.title,
          description: item.description,
          category: item.category,
          fileUrl: item.file_url,
          fileType: item.file_type,
          fileName: item.file_name,
          likesCount: item.post_likes?.[0]?.count || 0,
          commentsCount: item.comments?.[0]?.count || 0,
        }));

        if (pageNumber === 0) {
          setPosts(formattedPosts);
        } else {
          setPosts(prev => [...prev, ...formattedPosts]);
        }
        
        // If we got fewer items than requested, we've reached the end
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0);

    const subscription = DeviceEventEmitter.addListener('post_updated', () => {
        setPage(0);
        fetchPosts(0, true);
    });

    return () => {
        subscription.remove();
    };
  }, [selectedCategory, searchText]); 

  useFocusEffect(
    useCallback(() => {
      refreshProfile(); 
      // Note: We do NOT auto-fetch posts on focus to preserve scroll position 
    }, []) 
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
    refreshProfile();
  }, [selectedCategory, searchText]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleNavigate = (item: 'home' | 'messages' | 'notifications' | 'profile') => {
    const routeMap = { home: 'Home', messages: 'Messages', notifications: 'Notifications', profile: 'Profile' } as const;
    navigation.navigate(routeMap[item]);
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetails', { post });
  };

  const handleUserPress = (userId: string) => {
      setSelectedUserId(userId);
      setUserModalVisible(true);
  };

  const handleSharePress = (post: Post) => {
      setSelectedPostToShare(post);
      setShareModalVisible(true);
  };

  const handleLikesPress = (post: Post) => {
    setSelectedPostIdForLikes(post.id);
    setLikesModalVisible(true);
  };

  // Render Item for FlatList
  const renderPostItem: ListRenderItem<Post> = ({ item }) => (
    <PostCard 
        post={item} 
        onPress={() => handlePostPress(item)}
        onProfilePress={handleUserPress}
        onSharePress={handleSharePress}
        onLikesPress={handleLikesPress}
    />
  );

  // Footer for loading more
  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 50 }} />; // Padding from your file
    return (
      <View style={{ paddingVertical: 20, paddingBottom: 50 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No posts found.</Text>
      <Text style={styles.emptyStateSubText}>Be the first to post!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient 
        colors={GRADIENTS.primary} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 0.233, y: 1.155 }} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.logo}>
            <Text style={styles.logoWhite}>Campu</Text>
            <Text style={styles.logoGradient}>See</Text>
          </Text>
          <TouchableOpacity 
            style={styles.profileAvatar} 
            activeOpacity={0.8} 
            onPress={() => handleNavigate('profile')}
          >
            {profile?.avatar_url ? (
              <Image 
                source={{ uri: profile.avatar_url }} 
                style={styles.profileAvatarImage} 
              />
            ) : (
              <LinearGradient 
                colors={GRADIENTS.accent} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 0, y: 1 }} 
                style={styles.profileAvatarGradient}
              >
                <Text style={styles.profileInitials}>
                  {profile?.full_name ? getInitials(profile.full_name) : '??'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search..." />
      </View>

      <View style={styles.categoryContainer}>
        <View style={styles.categoryDividerTop} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category.id}
              type={category.type}
              label={category.label}
              isSelected={selectedCategory === category.type}
              onPress={() => setSelectedCategory(category.type)}
            />
          ))}
        </ScrollView>
        <View style={styles.categoryDividerBottom} />
      </View>

      <View style={styles.feedContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor={COLORS.primary} 
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyComponent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>

      {/* Modals */}
      {selectedUserId && (
          <UserProfileModal 
            visible={userModalVisible} 
            onClose={() => setUserModalVisible(false)} 
            userId={selectedUserId} 
          />
      )}
      
      {selectedPostToShare && (
          <SharePostModal 
            visible={shareModalVisible}
            onClose={() => setShareModalVisible(false)}
            post={selectedPostToShare}
          />
      )}

      {/* LIKES MODAL */}
      <PostLikesModal 
        visible={likesModalVisible}
        onClose={() => setLikesModalVisible(false)}
        postId={selectedPostIdForLikes}
        onUserPress={handleUserPress} 
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    width: '100%',
    height: 133,
    paddingTop: 67,
    paddingHorizontal: 34,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
  },
  logoWhite: {
    color: COLORS.textLight,
  },
  logoGradient: {
    color: COLORS.accent,
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  profileAvatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    resizeMode: 'cover',
  },
  profileAvatarGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
  },
  searchContainer: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 26,
    paddingVertical: 19,
  },
  categoryContainer: {
    backgroundColor: COLORS.backgroundLight,
    position: 'relative',
  },
  categoryDividerTop: {
    height: 1,
    backgroundColor: '#D3DEE8',
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  categoryDividerBottom: {
    height: 0,
    backgroundColor: '#D3DEE8',
  },
  feedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  feedContent: {
    padding: 18,
    gap: 8,
    // paddingBottom handled in ListFooterComponent logic
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  }
});