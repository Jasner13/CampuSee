import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Vibration,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av'; 
import { Avatar } from '../Avatar';
import { CategoryBadge } from '../CategoryBadge';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PostService } from '../../lib/postService';

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorInitials: string;
  authorAvatarUrl?: string | null;
  timestamp: string;
  label: string;
  title: string;
  description: string;
  category?: string;
  fileUrl?: string | null;
  fileType?: string | null; 
  fileName?: string | null;
  likesCount?: number;
  commentsCount?: number;
}

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onProfilePress?: (userId: string) => void;
  onSharePress?: (post: Post) => void;
  onLikesPress?: (post: Post) => void; 
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress, onProfilePress, onSharePress, onLikesPress }) => {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  
  // Ref for video player
  const videoRef = useRef<Video>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  // Robust check for media types
  const isImage = post.fileType === 'image' || (post.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.fileUrl));
  const isVideo = post.fileType === 'video' || (post.fileUrl && /\.(mp4|mov|avi)$/i.test(post.fileUrl));

  useEffect(() => {
    fetchLikeStatus();
  }, [post.id, currentUserId]);

  useEffect(() => {
    setLikesCount(post.likesCount || 0);
  }, [post.likesCount]);

  const fetchLikeStatus = async () => {
    if (!currentUserId) return;
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') return;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error in fetchLikeStatus:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    
    const previousState = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (Platform.OS === 'ios') {
        Vibration.vibrate(10);
    }

    try {
      const result = await PostService.handleReaction(post.id, currentUserId, 'like');
      if (result === 'like' && post.userId !== currentUserId) {
             await supabase.from('notifications').insert({
                user_id: post.userId,
                actor_id: currentUserId,
                type: 'like',
                title: 'New Like',
                content: 'liked your post.',
                resource_id: post.id, // Added resource_id here to link to the post
                is_read: false
            });
      }
    } catch (error) {
      console.error('Like error:', error);
      setIsLiked(previousState);
      setLikesCount(previousCount);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.9} 
          style={styles.cardInner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onProfilePress && onProfilePress(post.userId)}>
            <Avatar 
                initials={post.authorInitials} 
                avatarUrl={post.authorAvatarUrl} 
                size="small"
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <TouchableOpacity onPress={() => onProfilePress && onProfilePress(post.userId)}>
                <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
          <CategoryBadge category={post.category || 'default'} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
          <Text style={styles.description} numberOfLines={3}>{post.description}</Text>
        </View>

        {/* --- MEDIA SECTION --- */}
        {post.fileUrl && (
          <View style={styles.mediaContainer}>
            {isImage ? (
              <Image 
                source={{ uri: post.fileUrl }} 
                style={styles.postImage}
                resizeMode="cover"
              />
            ) : isVideo ? (
              <Video
                ref={videoRef}
                style={styles.postVideo}
                source={{ uri: post.fileUrl }}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping={false}
              />
            ) : (
              // Document View
              <View style={styles.attachmentBox}>
                 <View style={styles.attachmentIcon}>
                    <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                 </View>
                 <View style={{flex: 1}}>
                    <Text style={styles.attachmentText} numberOfLines={1}>
                        {post.fileName || 'Attached File'}
                    </Text>
                    <Text style={styles.attachmentSubText}>Tap to view</Text>
                 </View>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
                {/* WRAPPED IN TOUCHABLE OPACITY FOR LIKES MODAL */}
                <TouchableOpacity 
                  onPress={() => onLikesPress && likesCount > 0 && onLikesPress(post)}
                  disabled={likesCount === 0}
                >
                  {likesCount > 0 && (
                      <Text style={styles.statsText}>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</Text>
                  )}
                </TouchableOpacity>
            </View>
            <View style={styles.statsRight}>
                {post.commentsCount !== undefined && post.commentsCount > 0 && (
                    <Text style={styles.statsText}>{post.commentsCount} Comments</Text>
                )}
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={22} 
                    color={isLiked ? COLORS.error : "#9EA3AE"} 
                />
                <Text style={[styles.actionText, isLiked && { color: COLORS.error }]}>Like</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                <Ionicons name="chatbubble-outline" size={20} color={COLORS.textTertiary} />
                <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => onSharePress && onSharePress(post)}>
                <Ionicons name="share-social-outline" size={20} color={COLORS.textTertiary} />
                <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: { zIndex: 10 }, 
  cardInner: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  headerText: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  authorName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  timestamp: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, fontWeight: '500' },
  content: { marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6, lineHeight: 24 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, fontWeight: '400' },
  
  // Media Styles
  mediaContainer: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  postVideo: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  attachmentIcon: {
    marginRight: 10,
    padding: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary, 
  },
  attachmentSubText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  statsLeft: {},
  statsRight: {},
  statsText: { fontSize: 12, color: COLORS.textTertiary },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary },
});