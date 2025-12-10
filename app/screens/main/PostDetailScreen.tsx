import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  DeviceEventEmitter,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type PostDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PostDetails'>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

interface Reply {
  id: string;
  authorName: string;
  authorInitials: string;
  timestamp: string;
  label: string;
  content: string;
}

const MOCK_REPLIES: Reply[] = [
  {
    id: '1',
    authorName: 'First Last',
    authorInitials: 'XX',
    timestamp: 'Just now',
    label: 'Label',
    content: 'This is a sample reply to the post.',
  },
];

export default function PostDetailScreen() {
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { session } = useAuth();
  
  // Initialize local state with params so we can update it immediately
  const { post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);

  const isOwner = session?.user?.id === post.userId;

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [isSaving, setIsSaving] = useState(false);

  // Interaction State
  const [comment, setComment] = useState('');
  const [likes, setLikes] = useState(1039); 
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const deletePost = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const { error, data } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .select();

      if (error) {
        if (error.code === '23503') {
            throw new Error('Cannot delete post because it has related comments or likes.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Delete failed. You may not be the owner, or the post is already deleted.');
      }

      if (post.fileUrl) {
        try {
          const bucketName = 'post_attachments';
          const urlParts = post.fileUrl.split(`${bucketName}/`);
          if (urlParts.length > 1) {
            await supabase.storage.from(bucketName).remove([urlParts[1]]);
          }
        } catch (storageError) {
          console.warn('Post deleted, but file cleanup failed:', storageError);
        }
      }

      DeviceEventEmitter.emit('post_updated');
      Alert.alert('Success', 'Post deleted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      Alert.alert('Delete Failed', error.message || 'An unknown error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- EDIT FUNCTIONS ---

  const startEditing = () => {
    setEditTitle(post.title);
    setEditDescription(post.description);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditDescription(post.description);
  };

  const savePost = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('Validation Error', 'Title and description cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim()
        })
        .eq('id', post.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately
      setPost(prev => ({ 
        ...prev, 
        title: data.title, 
        description: data.description 
      }));

      setIsEditing(false);
      
      // Notify other screens (HomeFeed) to refresh
      DeviceEventEmitter.emit('post_updated');
      
      Alert.alert('Success', 'Post updated successfully');
    } catch (error: any) {
      console.error('Update failed:', error);
      Alert.alert('Update Failed', error.message || 'Could not update post.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------

  const handleMore = () => {
    if (isOwner) {
      Alert.alert(
        'Manage Post',
        'Choose an action',
        [
          { text: 'Edit', onPress: startEditing },
          { 
            text: 'Delete', 
            onPress: () => Alert.alert(
              'Confirm Delete',
              'Are you sure you want to delete this post?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: deletePost }
              ]
            ),
            style: 'destructive' 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
       Alert.alert('Options', 'Select an action', [
           { text: 'Report Post', onPress: () => console.log('Reported') },
           { text: 'Cancel', style: 'cancel' }
       ]);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSendPrivateMessage = () => {
    console.log('Send private message');
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      console.log('Send comment:', comment);
      setComment('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Post</Text>

        {!isEditing ? (
          <TouchableOpacity style={styles.moreButton} activeOpacity={0.7} onPress={handleMore}>
             <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
           <View style={{ width: 40 }} /> 
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.postCard}>
          {/* Author Header */}
          <View style={styles.authorSection}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{post.authorInitials}</Text>
            </LinearGradient>

            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
            
            {/* Added "Study" Badge from design */}
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Study</Text>
            </View>
          </View>

          {/* EDITABLE TITLE */}
          {isEditing ? (
            <TextInput
                style={styles.editTitleInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Post Title"
                placeholderTextColor={COLORS.textTertiary}
            />
          ) : (
            <Text style={styles.postTitle}>{post.title}</Text>
          )}

          {/* EDITABLE DESCRIPTION */}
          {isEditing ? (
             <TextInput
                style={styles.editDescInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="What's on your mind?"
                placeholderTextColor={COLORS.textTertiary}
                multiline
            />
          ) : (
            <Text style={styles.postDescription}>
                {post.description}
            </Text>
          )}

          {/* SAVE / CANCEL BUTTONS */}
          {isEditing && (
            <View style={styles.editButtonsRow}>
                <TouchableOpacity 
                    style={[styles.editButton, styles.cancelButton]} 
                    onPress={cancelEditing}
                    disabled={isSaving}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.editButton, styles.saveButton]} 
                    onPress={savePost}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
          )}

          {post.fileUrl && !isEditing && (
             <View style={styles.attachment}>
                <View style={styles.attachmentIcon}>
                    {/* Changed color to white to match blue bg or blue icon on light bg */}
                    <Ionicons name="document-text" size={24} color="#5C6BC0" />
                </View>
                <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName}>Hello.doc</Text>
                    <Text style={styles.attachmentSize}>128.67 kb</Text>
                </View>
            </View>
          )}

          {/* Buttons & Stats */}
          {!isEditing && (
            <>
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={handleSendPrivateMessage}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        // Switched to primary gradient (Purple/Violet) to match design
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.messageButtonGradient}
                    >
                        <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.messageButtonText}>Send Private Message</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={handleLike}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons 
                                name={isLiked ? "heart" : "heart-outline"} 
                                size={22} 
                                color={isLiked ? COLORS.error : "#9EA3AE"} 
                            />
                        </View>
                        <Text style={styles.statNumber}>{likes}</Text>
                    </TouchableOpacity>

                    <View style={styles.statItem}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="chatbubble-outline" size={22} color="#9EA3AE" />
                        </View>
                        <Text style={styles.statNumber}>281</Text>
                    </View>

                    <TouchableOpacity style={styles.statItem}>
                         <View style={styles.iconCircle}>
                            <Ionicons name="share-social-outline" size={22} color="#9EA3AE" />
                         </View>
                        <Text style={styles.statNumber}>24</Text>
                    </TouchableOpacity>

                    {/* Spacer to push Bookmark to the right */}
                    <View style={{ flex: 1 }} />

                    <TouchableOpacity style={styles.statItem}>
                         <View style={styles.iconCircle}>
                             <Ionicons name="bookmark-outline" size={22} color="#9EA3AE" />
                         </View>
                         <Text style={styles.statNumber}>24</Text>
                    </TouchableOpacity>
                </View>
            </>
          )}
        </View>

        {/* Public Replies Section */}
        {!isEditing && (
            <View style={styles.repliesSection}>
                <Text style={styles.repliesTitle}>Public Replies (2)</Text>

                {MOCK_REPLIES.map((reply) => (
                    <View key={reply.id} style={styles.replyCard}>
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.replyAvatar}
                        >
                            <Text style={styles.replyAvatarText}>{reply.authorInitials}</Text>
                        </LinearGradient>

                        <View style={styles.replyContent}>
                            <View style={styles.replyHeader}>
                                <Text style={styles.replyAuthorName}>{reply.authorName}</Text>
                                <View style={styles.replyLabelBadge}>
                                    <Text style={styles.replyLabelText}>{reply.label}</Text>
                                </View>
                            </View>
                            <Text style={styles.replyTimestamp}>{reply.timestamp}</Text>
                            <Text style={styles.replyText}>{reply.content}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}

        {/* Comment Input */}
        {!isEditing && (
            <View style={styles.commentSection}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a public comment..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendComment}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sendButtonGradient}
                    >
                        <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Slightly gray outer background to pop the white cards
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1B2D',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1B2D',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#9EA3AE',
    fontWeight: '500',
  },
  // Added Badge Style
  headerBadge: {
    backgroundColor: '#E6F7F5', // Light Green bg
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: '#00BFA5', // Teal/Green text
    fontWeight: '700',
    fontSize: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1B2D',
    marginBottom: 12,
    lineHeight: 28,
  },
  postDescription: {
    fontSize: 15,
    color: '#525769',
    lineHeight: 24,
    marginBottom: 20,
  },
  // EDIT INPUT STYLES
  editTitleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
  },
  editDescInput: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // ----------------
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6', // Light Indigo/Purple Tint
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  attachmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1B2D',
    marginBottom: 4,
  },
  attachmentSize: {
    fontSize: 13,
    color: '#9EA3AE',
  },
  messageButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F7F8FA', // Circle bg for icons
      justifyContent: 'center',
      alignItems: 'center',
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9EA3AE',
    marginLeft: 6,
  },
  repliesSection: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 100, // Space for footer
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#525769',
    marginBottom: 16,
    marginLeft: 4,
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replyAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'space-between'
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1B2D',
  },
  replyLabelBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  replyLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9EA3AE',
  },
  replyTimestamp: {
    fontSize: 12,
    color: '#9EA3AE',
    marginBottom: 8,
  },
  replyText: {
    fontSize: 14,
    color: '#525769',
    lineHeight: 20,
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginRight: 12,
    height: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});