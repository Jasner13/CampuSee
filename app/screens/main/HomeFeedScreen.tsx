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
  Image 
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
import { GRADIENTS, COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { CATEGORIES, CategoryType } from '../../constants/categories';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// FIX: Define composite type for navigation (Tab + Stack)
type HomeFeedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

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

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id, 
          created_at, 
          title, 
          description, 
          category, 
          user_id, 
          file_url, 
          profiles (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

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
          authorInitials: getInitials(item.profiles?.full_name),
          authorAvatarUrl: item.profiles?.avatar_url,
          timestamp: getRelativeTime(item.created_at),
          label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          title: item.title,
          description: item.description,
          category: item.category,
          fileUrl: item.file_url
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const subscription = DeviceEventEmitter.addListener('post_updated', () => {
        setLoading(true);
        fetchPosts();
    });

    return () => {
        subscription.remove();
    };
  }, []); 

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetchPosts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchText]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      refreshProfile(); 
    }, [selectedCategory, searchText]) 
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
    refreshProfile();
  }, []);

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

      <ScrollView 
        style={styles.feedContainer} 
        contentContainerStyle={styles.feedContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary} 
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No posts found.</Text>
            <Text style={styles.emptyStateSubText}>Be the first to post!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onPress={() => handlePostPress(post)} />
          ))
        )}
      </ScrollView>

      <BottomNav selected="home" onNavigate={handleNavigate} onCreatePost={handleCreatePost} />
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
    gap: 16,
    paddingBottom: 100,
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