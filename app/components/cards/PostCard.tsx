import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  PanResponder,
  Vibration,
  GestureResponderEvent,
  PanResponderGestureState,
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
}

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

const REACTIONS = [
  { id: 'like',  emoji: '👍', label: 'Like',  color: '#3B82F6' },
  { id: 'love',  emoji: '❤️', label: 'Love',  color: '#EF4444' },
  { id: 'haha',  emoji: '😆', label: 'Haha',  color: '#F59E0B' },
  { id: 'wow',   emoji: '😮', label: 'Wow',   color: '#F59E0B' },
  { id: 'sad',   emoji: '😢', label: 'Sad',   color: '#F59E0B' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: '#EF4444' },
] as const;

type ReactionType = typeof REACTIONS[number]['id'] | null;

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const [currentReaction, setCurrentReaction] = useState<ReactionType>(null);
  
  // 1. Ref to track current reaction in PanResponder (Fixes Stale Closure)
  const currentReactionRef = useRef<ReactionType>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hoveredReactionIndex, setHoveredReactionIndex] = useState<number | null>(null);

  const pickerScale = useRef(new Animated.Value(0)).current;
  const hoverScales = useRef(REACTIONS.map(() => new Animated.Value(1))).current;

  const hasAttachment = !!post.fileUrl;
  const isImage = post.fileUrl ? /\.(jpg|jpeg|png|gif|webp)$/i.test(post.fileUrl) : false;

  // Sync state to ref
  useEffect(() => {
    currentReactionRef.current = currentReaction;
  }, [currentReaction]);

  useEffect(() => {
    fetchCurrentReaction();
  }, [post.id, currentUserId]);

  const fetchCurrentReaction = async () => {
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('reaction_type')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.reaction_type) {
        setCurrentReaction(data.reaction_type as ReactionType);
      } else if (data) {
        // Fallback for old likes without type
        setCurrentReaction('like');
      } else {
        setCurrentReaction(null);
      }
    } catch (error) {
      console.error('Error fetching reaction:', error);
    }
  };

  const handleSetReaction = async (reactionId: ReactionType) => {
    if (!currentUserId) return;
    
    // 2. Use Ref for logic to ensure we are toggling against the LATEST state
    const previous = currentReactionRef.current;
    const newReaction = previous === reactionId ? null : reactionId;
    
    // Optimistic Update
    setCurrentReaction(newReaction);
    
    // NOTE: We do NOT close the picker here automatically anymore. 
    // This allows the PanResponder release animation to handle the UI update smoothly.

    try {
        if (!newReaction) {
            // Delete
            await supabase
              .from('post_likes')
              .delete()
              .eq('post_id', post.id)
              .eq('user_id', currentUserId);
        } else {
            // Upsert
            await supabase
              .from('post_likes')
              .upsert({
                post_id: post.id,
                user_id: currentUserId,
                reaction_type: newReaction,
              }, { onConflict: 'user_id, post_id' });
        }
    } catch (error) {
      console.error('Reaction error:', error);
      setCurrentReaction(previous); // Revert
    }
  };

  // --- PanResponder Logic ---

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);

  const closePicker = () => {
    Animated.timing(pickerScale, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setIsPickerOpen(false);
      setHoveredReactionIndex(null);
      hoverScales.forEach(scale => scale.setValue(1));
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => !isPickerOpen,

      onPanResponderGrant: () => {
        isDragging.current = false;
        hasMoved.current = false;
        longPressTimer.current = setTimeout(() => {
          setIsPickerOpen(true);
          isDragging.current = true;
          Vibration.vibrate(50);
          Animated.spring(pickerScale, { toValue: 1, useNativeDriver: true }).start();
        }, 300);
      },

      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          hasMoved.current = true;
        }

        if (isDragging.current) {
          // Adjust logic for better hit testing
          const REACTION_WIDTH = 44;
          const currentX = gestureState.dx; 
          
          // Offset by ~20px to start selection from the first emoji when dragging starts
          let index = Math.floor((currentX + 20) / REACTION_WIDTH);
          
          if (index < 0) index = 0;
          if (index >= REACTIONS.length) index = REACTIONS.length - 1;

          setHoveredReactionIndex((prev) => {
            if (prev !== index) {
                Animated.spring(hoverScales[index], { toValue: 1.5, useNativeDriver: true }).start();
                if (prev !== null) {
                    Animated.spring(hoverScales[prev], { toValue: 1, useNativeDriver: true }).start();
                }
                if (Platform.OS === 'ios') Vibration.vibrate(10); 
            }
            return index;
          });
        } else {
            // Cancel long press if user moves finger before timer fires (scroll intent)
            if (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10) {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }
        }
      },

      onPanResponderRelease: () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);

        if (isDragging.current && isPickerOpen) {
          // Case 1: Dragged and Released -> Select hovered reaction
          if (hoveredReactionIndex !== null) {
            handleSetReaction(REACTIONS[hoveredReactionIndex].id);
          }
          closePicker();
        } else if (!hasMoved.current && !isPickerOpen) {
          // Case 2: Simple Tap -> Toggle Like (using default 'like' or removing)
          handleSetReaction('like');
        } else {
          // Case 3: Dragged but not enough to trigger picker, or just cancelling
          closePicker(); 
        }
        
        isDragging.current = false;
        hasMoved.current = false;
      },
      
      onPanResponderTerminate: () => {
         if (longPressTimer.current) clearTimeout(longPressTimer.current);
         closePicker();
         isDragging.current = false;
         hasMoved.current = false;
      }
    })
  ).current;

  // --- Render Helpers ---

  const getActiveReactionDisplay = () => {
    if (!currentReaction) {
      return { 
        type: 'icon',
        name: 'thumbs-up-outline', 
        color: COLORS.textTertiary, 
        label: 'Like',
        emoji: null
      };
    }
    const r = REACTIONS.find(x => x.id === currentReaction);
    if (r) {
        return { 
          type: 'emoji',
          name: '',
          color: r.color, 
          label: r.label,
          emoji: r.emoji
        };
    }
    // Fallback
    return { 
      type: 'icon',
      name: 'thumbs-up', 
      color: COLORS.primary, 
      label: 'Liked',
      emoji: null
    };
  };

  const active = getActiveReactionDisplay();

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.9} 
          style={styles.cardInner}
      >
        <View style={styles.header}>
          <Avatar 
            initials={post.authorInitials} 
            avatarUrl={post.authorAvatarUrl} 
            size="small"
          />
          <View style={styles.headerText}>
            <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
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

        <View style={styles.divider} />

        <View style={styles.footer} pointerEvents="box-none">
            {isPickerOpen && (
                 <Animated.View style={[styles.reactionPicker, { transform: [{ scale: pickerScale }] }]}>
                    {REACTIONS.map((reaction, index) => (
                        <View key={reaction.id} style={styles.reactionItem}>
                            <Animated.Text style={[styles.reactionEmoji, { transform: [{ scale: hoverScales[index] }] }]}>
                                {reaction.emoji}
                            </Animated.Text>
                        </View>
                    ))}
                 </Animated.View>
            )}

            <View {...panResponder.panHandlers} style={styles.actionButtonWrapper}>
                <View style={styles.actionButton}>
                    {active.type === 'emoji' ? (
                      <Text style={styles.reactionEmojiButton}>{active.emoji}</Text>
                    ) : (
                      <Ionicons name={active.name as any} size={20} color={active.color} />
                    )}
                    <Text style={[styles.actionText, { color: active.color }]}>
                        {active.label}
                    </Text>
                </View>
            </View>
          
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                <Ionicons name="chatbubble-outline" size={20} color={COLORS.textTertiary} />
                <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
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
    overflow: 'visible',
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    position: 'relative',
    zIndex: 20,
  },
  actionButtonWrapper: {
     zIndex: 30,
     // Ensure touch area is sufficient
     minWidth: 60, 
     alignItems: 'center',
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
  reactionPicker: {
    position: 'absolute',
    bottom: 50,
    left: -10, // Slight offset to align with thumb position better
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 6,
    paddingHorizontal: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    zIndex: 100,
  },
  reactionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 40,
    position: 'relative',
  },
  reactionEmoji: {
    fontSize: 24,
  },
  reactionEmojiButton: {
    fontSize: 20,
  },
});