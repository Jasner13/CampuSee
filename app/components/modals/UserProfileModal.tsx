import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/colors';
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
  
  // Stats State
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
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      // 2. Check Follow Status
      if (session?.user) {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        
        setIsFollowing(count ? count > 0 : false);
      }

      // 3. Fetch Stats & Posts (Parallel)
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
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        if (error) throw error;
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: userId
          });
        if (error) throw error;
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        
        // Notification
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
      onClose(); // Close modal first
      
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

  // Render Item for FlatList (User's Posts)
  const renderPostItem = ({ item }: { item: any }) => (
      <TouchableOpacity style={styles.postItem} onPress={() => handlePostPress(item)} activeOpacity={0.7}>
          <View style={styles.postHeader}>
             <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
             <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.postBody} numberOfLines={2}>{item.description}</Text>
          <View style={styles.postFooter}>
              <Text style={styles.postCategory}>{item.category}</Text>
              {item.file_url && <Ionicons name="attach" size={16} color={COLORS.textTertiary} />}
          </View>
      </TouchableOpacity>
  );

  // Header Component (Profile Info + Stats)
  const renderHeader = () => (
    <>
        <View style={styles.profileHeader}>
            <Image 
                source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
            />
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.program}>{profile.program || 'Student'}</Text>
            <Text style={styles.bio}>{profile.bio || 'No bio available.'}</Text>

            {/* Stats Row */}
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

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
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
                    <Text style={styles.emptyText}>No posts yet.</Text>
                }
            />
          ) : (
            <Text style={{ marginTop: 40 }}>User not found</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
  },
  listContent: {
      paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
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
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  program: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  // Stats Styles
  statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      width: '100%',
  },
  statItem: {
      alignItems: 'center',
      paddingHorizontal: 16,
  },
  statDivider: {
      width: 1,
      height: 24,
      backgroundColor: '#E0E0E0',
  },
  statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
  },
  statLabel: {
      fontSize: 12,
      color: COLORS.textTertiary,
      marginTop: 2,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  followingButtonText: {
    color: COLORS.primary,
  },
  // Post List Styles
  postsListHeader: {
      paddingHorizontal: 20,
      marginBottom: 10,
  },
  postsListTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textPrimary,
  },
  postItem: {
      backgroundColor: '#F9FAFB',
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#F0F0F0',
  },
  postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
  },
  postTitle: {
      fontSize: 15,
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
      fontSize: 13,
      color: COLORS.textSecondary,
      marginBottom: 8,
      lineHeight: 18,
  },
  postFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  postCategory: {
      fontSize: 11,
      color: COLORS.primary,
      fontWeight: '500',
      backgroundColor: 'rgba(92, 107, 192, 0.1)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
  },
  emptyText: {
      textAlign: 'center',
      color: COLORS.textTertiary,
      marginTop: 20,
  }
});