import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Vibration,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../Avatar';
import { CategoryBadge } from '../CategoryBadge';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
  likesCount?: number;
  commentsCount?: number;
}

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onProfilePress?: (userId: string) => void;
  onSharePress?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress, onProfilePress, onSharePress }) => {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const hasAttachment = !!post.fileUrl;
  const isImage = post.fileUrl ? /\.(jpg|jpeg|png|gif|webp)$/i.test(post.fileUrl) : false;

  useEffect(() => {
    fetchLikeStatus();
  }, [post.id, currentUserId]);

  // Sync count if parent updates
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

      if (error && error.code !== 'PGRST116') {
         console.error('Error fetching like status:', error);
         return;
      }
      
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error in fetchLikeStatus:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    
    // Optimistic Update
    const previousState = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (Platform.OS === 'ios') {
        Vibration.vibrate(10); // Subtle haptic feedback
    }

    try {
      if (previousState) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);
          
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: currentUserId,
          });

        if (error) throw error;

        // Send Notification if not owner
        if (post.userId !== currentUserId) {
            // Check if notification already exists to avoid spamming (optional logic)
             await supabase.from('notifications').insert({
                user_id: post.userId,
                actor_id: currentUserId,
                type: 'like',
                title: 'New Like',
                content: 'Someone liked your post.',
                is_read: false
            });
        }
      }
    } catch (error) {
      console.error('Like error:', error);
      // Revert on error
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

        {hasAttachment && (
          <View style={styles.attachmentContainer}>
              <View style={[
                  styles.attachmentIconBox, 
                  isImage ? { backgroundColor: '#E0E7FF' } : { backgroundColor: '#FEF3C7' }
              ]}>
                  <Ionicons 
                      name={isImage ? "image" : "document-text"} 
                      size={20} 
                      color={isImage ? COLORS.primary : COLORS.accentDark} 
                  />
              </View>
              <Text style={styles.attachmentText}>
                  {isImage ? 'Image Attachment' : 'File Attachment'}
              </Text>
          </View>
        )}
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
                {likesCount > 0 && (
                    <Text style={styles.statsText}>{likesCount} Likes</Text>
                )}
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
                <Text style={[
                    styles.actionText, 
                    isLiked && { color: COLORS.error }
                ]}>
                    Like
                </Text>
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
  cardContainer: {
    marginBottom: 16,
    zIndex: 10, 
  },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  authorName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  content: {
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attachmentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statsLeft: {},
  statsRight: {},
  statsText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
});