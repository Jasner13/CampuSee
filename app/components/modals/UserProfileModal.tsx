// app/components/modals/UserProfileModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, Alert, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose, userId }) => {
  const { session } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    if (visible && userId) {
      fetchProfileData();
    }
  }, [visible, userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      if (session?.user) {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        
        setIsFollowing(count ? count > 0 : false);
      }

      const [postsCount, followersCount, followingCount, postsData] = await Promise.all([
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
          supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      setStats({
          posts: postsCount.count || 0,
          followers: followersCount.count || 0,
          following: followingCount.count || 0
      });

      if (postsData.data) {
          setUserPosts(postsData.data);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user) return;
    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        if (error) throw error;
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: userId
          });
        if (error) throw error;
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        
        await supabase.from('notifications').insert({
            user_id: userId,
            actor_id: session.user.id,
            type: 'follow',
            title: 'New Follower',
            content: 'started following you.'
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostPress = (post: any) => {
      onClose();
      
      const formattedPost = {
          id: post.id,
          userId: profile.id,
          authorName: profile.full_name,
          authorInitials: profile.full_name 
            ? profile.full_name.split(' ').map((n:string) => n[0]).join('').substring(0,2).toUpperCase() 
            : '??',
          authorAvatarUrl: profile.avatar_url,
          timestamp: new Date(post.created_at).toLocaleDateString(),
          label: profile.program || 'Student',
          title: post.title,
          description: post.description,
          category: post.category,
          fileUrl: post.file_url,
          fileName: post.file_name,
          fileType: post.file_type,
      };

      navigation.navigate('PostDetails', { post: formattedPost });
  };

  const renderPostItem = ({ item }: { item: any }) => (
      <TouchableOpacity style={styles.postItem} onPress={() => handlePostPress(item)} activeOpacity={0.8}>
          <View style={styles.postHeader}>
             <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
             <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.postBody} numberOfLines={2}>{item.description}</Text>
          <View style={styles.postFooter}>
              <View style={styles.categoryBadge}>
                <Text style={styles.postCategory}>{item.category}</Text>
              </View>
              {item.file_url && <Ionicons name="attach" size={16} color={COLORS.textTertiary} />}
          </View>
      </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
        <View style={styles.profileHeader}>
            <Image 
                source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
            />
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.program}>{profile.program || 'Student'}</Text>
            
            {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.posts}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.followers}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.following}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </View>
            </View>

            {session?.user?.id !== userId && (
                <TouchableOpacity 
                    style={[styles.followButton, isFollowing && styles.followingButton]} 
                    onPress={handleFollowToggle}
                    disabled={followLoading}
                >
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
        
        <View style={styles.postsListHeader}>
            <Text style={styles.postsListTitle}>Recent Posts</Text>
        </View>
    </>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
             <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : profile ? (
            <FlatList
                data={userPosts}
                keyExtractor={(item) => item.id}
                renderItem={renderPostItem}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No posts yet.</Text>
                    </View>
                }
            />
          ) : (
            <Text style={{ marginTop: 40, textAlign: 'center' }}>User not found</Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    height: '85%',
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleBarContainer: {
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
  },
  handleBar: {
      width: 40,
      height: 4,
      backgroundColor: COLORS.border,
      borderRadius: 2,
  },
  listContent: {
      paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 6,
  },
  profileHeader: {
      alignItems: 'center',
      padding: 24,
      paddingBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  program: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      width: '100%',
      backgroundColor: COLORS.background,
      paddingVertical: 12,
      borderRadius: 16,
  },
  statItem: {
      alignItems: 'center',
      paddingHorizontal: 20,
  },
  statDivider: {
      width: 1,
      height: 24,
      backgroundColor: COLORS.border,
  },
  statNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textPrimary,
  },
  statLabel: {
      fontSize: 12,
      color: COLORS.textTertiary,
      marginTop: 2,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  followingButtonText: {
    color: COLORS.primary,
  },
  postsListHeader: {
      paddingHorizontal: 20,
      marginBottom: 12,
      marginTop: 8,
  },
  postsListTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textPrimary,
      fontFamily: FONTS.bold,
  },
  postItem: {
      backgroundColor: COLORS.backgroundLight,
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 2,
  },
  postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  postTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.textPrimary,
      flex: 1,
      marginRight: 8,
  },
  postDate: {
      fontSize: 12,
      color: COLORS.textTertiary,
  },
  postBody: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
  },
  postFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  categoryBadge: {
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
  },
  postCategory: {
      fontSize: 11,
      color: COLORS.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
  },
  emptyContainer: {
      padding: 20,
      alignItems: 'center',
  },
  emptyText: {
      textAlign: 'center',
      color: COLORS.textTertiary,
      fontFamily: FONTS.regular,
  }
});