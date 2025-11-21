import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { SearchBar } from '../../components/SearchBar';
import { CategoryChip } from '../../components/CategoryChip';
import { PostCard, Post } from '../../components/cards/PostCard';
import { BottomNav } from '../../components/BottomNav';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { CATEGORIES, CategoryType } from '../../constants/categories';

type HomeFeedScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorName: 'First Last',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Label',
    title: 'Lorem Ipsum Dolor Sit Amet',
    description: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: '2',
    authorName: 'First Last',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Label',
    title: 'Lorem Ipsum Dolor Sit Amet',
    description: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: '3',
    authorName: 'First Last',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Label',
    title: 'Lorem Ipsum Dolor Sit Amet',
    description: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

export const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<HomeFeedScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 0.233, y: 1.155 }} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>
            <Text style={styles.logoWhite}>Campu</Text>
            <Text style={styles.logoGradient}>See</Text>
          </Text>
          <TouchableOpacity style={styles.profileAvatar} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.profileAvatarGradient}>
              <Text style={styles.profileInitials}>JD</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search..." />
      </View>

      <View style={styles.categoryContainer}>
        <View style={styles.categoryDividerTop} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScrollContent}>
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

      <ScrollView style={styles.feedContainer} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        {MOCK_POSTS.map((post) => (
          <PostCard key={post.id} post={post} onPress={() => handlePostPress(post)} />
        ))}
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
});
