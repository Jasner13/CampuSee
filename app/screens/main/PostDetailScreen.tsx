import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  DeviceEventEmitter,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  SafeAreaView,
  FlatList,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import type { RootStackParamList } from '../../navigation/types';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Comment } from '../../types';
import { CategoryBadge } from '../../components/CategoryBadge';

type PostDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PostDetails'>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

export default function PostDetailScreen() {
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  
  const { post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);

  // Interaction State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  
  const [likesCount, setLikesCount] = useState(0); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Image Viewer State
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Determine if file is an image
  const getFileName = (url: string) => {
    try {
        const decoded = decodeURIComponent(url);
        const cleanUrl = decoded.split('?')[0]; 
        return cleanUrl.split('/').pop() || 'attachment';
    } catch (e) {
        return 'attachment';
    }
  };
  const fileName = post.fileUrl ? getFileName(post.fileUrl) : '';
  const isImage = /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(fileName);
  const isOwner = currentUserId === post.userId;

  // --- Initial Data Fetching ---
  useEffect(() => {
    fetchComments();
    fetchInteractionStatus();
    fetchLikesCount();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(id, full_name, avatar_url, program)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchLikesCount = async () => {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    
    if (!error && count !== null) {
      setLikesCount(count);
    }
  };

  const fetchInteractionStatus = async () => {
    if (!currentUserId) return;

    // Check Like
    const { data: likeData } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();
    setIsLiked(!!likeData);

    // Check Save
    const { data: saveData } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();
    setIsSaved(!!saveData);
  };

  // --- Handlers ---

  const handleBack = () => navigation.goBack();

  const handleLike = async () => {
    if (!currentUserId) return;

    // Optimistic Update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(previousLiked ? likesCount - 1 : likesCount + 1);

    try {
      if (previousLiked) {
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
          .insert({ post_id: post.id, user_id: currentUserId });
        if (error) throw error;

        // Send Notification if not owner
        if (post.userId !== currentUserId) {
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
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      Alert.alert('Error', 'Failed to update like status.');
    }
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
        if (previousSaved) {
            // Unsave
            const { error } = await supabase
                .from('saved_posts')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', currentUserId);
            if (error) throw error;
        } else {
            // Save
            const { error } = await supabase
                .from('saved_posts')
                .insert({ post_id: post.id, user_id: currentUserId });
            if (error) throw error;
        }
    } catch (error) {
        console.error('Save error:', error);
        setIsSaved(previousSaved);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUserId) return;
    
    setSendingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: post.id,
            user_id: currentUserId,
            content: commentText.trim()
        })
        .select('*, profiles(id, full_name, avatar_url, program)')
        .single();

      if (error) throw error;

      // Update UI
      setComments(prev => [...prev, data as Comment]);
      setCommentText('');

      // Send Notification
      if (post.userId !== currentUserId) {
        await supabase.from('notifications').insert({
            user_id: post.userId,
            actor_id: currentUserId,
            type: 'comment',
            title: 'New Comment',
            content: `Commented: ${commentText.trim().substring(0, 50)}...`,
            is_read: false
        });
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post comment.');
    } finally {
      setSendingComment(false);
    }
  };

  const deletePost = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      
      DeviceEventEmitter.emit('post_updated');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Delete Failed', error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const savePostEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      Alert.alert('Validation Error', 'Title and description cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ title: editTitle.trim(), description: editDescription.trim() })
        .eq('id', post.id)
        .select()
        .single();

      if (error) throw error;

      setPost(prev => ({ ...prev, title: data.title, description: data.description }));
      setIsEditing(false);
      DeviceEventEmitter.emit('post_updated');
      Alert.alert('Success', 'Post updated successfully');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMore = () => {
    if (isOwner) {
      Alert.alert('Manage Post', 'Choose an action', [
        { text: 'Edit', onPress: () => {
            setEditTitle(post.title);
            setEditDescription(post.description);
            setIsEditing(true);
        }},
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Confirm', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: deletePost }
        ])},
        { text: 'Cancel', style: 'cancel' }
      ]);
    } else {
       Alert.alert('Options', 'Select an action', [
           { text: 'Report Post', onPress: () => console.log('Reported') },
           { text: 'Cancel', style: 'cancel' }
       ]);
    }
  };

  const handleViewAttachment = async () => {
    if (!post.fileUrl) return;
    if (isImage) {
      setImageModalVisible(true);
    } else {
      try {
        await WebBrowser.openBrowserAsync(post.fileUrl);
      } catch (err) {
        Alert.alert('Error', 'Could not open the file.');
      }
    }
  };

  const handleSendPrivateMessage = () => {
    navigation.navigate('MessagesChat', {
        peerId: post.userId,
        peerName: post.authorName,
        peerInitials: post.authorInitials,
        peerAvatarUrl: post.authorAvatarUrl,
    });
  };

  // --- Render Components ---

  const renderHeader = () => (
    <View style={styles.postCard}>
        <View style={styles.authorSection}>
            <View style={{ marginRight: 12 }}>
                <Avatar initials={post.authorInitials} avatarUrl={post.authorAvatarUrl} size="default" />
            </View>

            <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
            
            <CategoryBadge category={post.category || 'default'} />
        </View>

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
        <Text style={styles.postDescription}>{post.description}</Text>
        )}

        {isEditing && (
        <View style={styles.editButtonsRow}>
            <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]} 
                onPress={() => setIsEditing(false)}
                disabled={isSaving}
            >
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]} 
                onPress={savePostEdit}
                disabled={isSaving}
            >
                {isSaving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
        </View>
        )}

        {/* --- CHANGED: Display Image directly if it's an image --- */}
        {post.fileUrl && !isEditing && (
            <View style={styles.mediaContainer}>
                {isImage ? (
                    // 1. Show Image directly
                    <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
                        <Image 
                            source={{ uri: post.fileUrl }} 
                            style={styles.postImage} 
                            resizeMode="cover" 
                        />
                    </TouchableOpacity>
                ) : (
                    // 2. Fallback to Attachment Box for non-images (PDFs, etc.)
                    <TouchableOpacity style={styles.attachment} onPress={handleViewAttachment} activeOpacity={0.7}>
                        <View style={styles.attachmentIcon}>
                            <Ionicons name="document-text" size={24} color="#5C6BC0" />
                        </View>
                        <View style={styles.attachmentInfo}>
                            <Text style={styles.attachmentName} numberOfLines={1}>{fileName}</Text>
                            <Text style={styles.attachmentSize}>Tap to open file</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        )}

        {!isEditing && (
        <>
            {!isOwner && (
                <TouchableOpacity style={styles.messageButton} onPress={handleSendPrivateMessage} activeOpacity={0.8}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.messageButtonGradient}
                    >
                        <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.messageButtonText}>Send Private Message</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            <View style={styles.statsRow}>
                <TouchableOpacity style={styles.statItem} onPress={handleLike} activeOpacity={0.7}>
                    <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isLiked ? COLORS.error : "#9EA3AE"} 
                    />
                    <Text style={styles.statNumber}>{likesCount}</Text>
                </TouchableOpacity>

                <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={20} color="#9EA3AE" />
                    <Text style={styles.statNumber}>{comments.length}</Text>
                </View>

                {/* Share placeholder */}
                <TouchableOpacity style={styles.statItem}>
                    <Ionicons name="share-outline" size={20} color="#9EA3AE" />
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={styles.statItem} onPress={handleSave}>
                    <Ionicons 
                        name={isSaved ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={isSaved ? COLORS.primary : "#9EA3AE"} 
                    />
                </TouchableOpacity>
            </View>
        </>
        )}

        {!isEditing && (
            <Text style={styles.repliesTitle}>
                Comments ({comments.length})
            </Text>
        )}
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => {
    const initials = item.profiles?.full_name 
        ? item.profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()
        : '??';
    
    return (
        <View style={styles.replyCard}>
            <View style={styles.replyAvatarContainer}>
                <Avatar 
                    initials={initials} 
                    avatarUrl={item.profiles?.avatar_url} 
                    size="small" 
                />
            </View>

            <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                    <Text style={styles.replyAuthorName}>{item.profiles?.full_name || 'Unknown'}</Text>
                    {item.profiles?.program && (
                        <View style={styles.replyLabelBadge}>
                            <Text style={styles.replyLabelText}>{item.profiles.program}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.replyTimestamp}>
                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text style={styles.replyText}>{item.content}</Text>
            </View>
        </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
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

      {/* Main Content List */}
      <FlatList
        data={isEditing ? [] : comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={loadingComments} onRefresh={() => {
                fetchComments();
                fetchLikesCount();
            }} />
        }
        ListEmptyComponent={
            !loadingComments && !isEditing ? (
                <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
            ) : null
        }
      />

      {/* Comment Input */}
      {!isEditing && (
          <View style={styles.commentSection}>
              <TextInput
                  style={styles.commentInput}
                  placeholder="Add a public comment..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline={false}
              />
              <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendComment}
                  activeOpacity={0.7}
                  disabled={sendingComment}
              >
                  <LinearGradient
                      colors={GRADIENTS.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sendButtonGradient}
                  >
                      {sendingComment ? (
                          <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                      )}
                  </LinearGradient>
              </TouchableOpacity>
          </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity 
                style={styles.closeModalButton} 
                onPress={() => setImageModalVisible(false)}
            >
                <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
            
            {post.fileUrl && (
                <Image 
                    source={{ uri: post.fileUrl }} 
                    style={styles.fullScreenImage} 
                    resizeMode="contain"
                />
            )}
        </SafeAreaView>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', 
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
  contentContainer: {
    paddingBottom: 20,
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
    marginBottom: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  headerBadge: {
    backgroundColor: '#E6F7F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: '#00BFA5',
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
  
  // --- NEW STYLES FOR MEDIA ---
  mediaContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 300, // Taller than the feed version for detail view
    backgroundColor: '#F1F5F9',
  },
  // ---------------------------

  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6', 
    padding: 16,
    borderRadius: 12,
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
    marginRight: 24,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9EA3AE',
    marginLeft: 4,
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#525769',
    marginTop: 8,
    marginBottom: 8,
  },
  emptyCommentsText: {
    textAlign: 'center',
    color: '#9EA3AE',
    marginTop: 20,
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  replyAvatarContainer: {
    marginRight: 12,
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
    maxHeight: 48,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
});