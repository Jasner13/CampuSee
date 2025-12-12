import React, { useState, useEffect, useRef } from 'react';
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
  FlatList,
  RefreshControl,
  Keyboard,
  SafeAreaView as RNSafeAreaView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/Avatar';
import { Comment } from '../../types';
import { CategoryBadge } from '../../components/CategoryBadge';

type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  'PostDetails'
>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

// Interface for local comment structure
interface ExtendedComment extends Comment {
  parent_id: string | null;
  replies?: ExtendedComment[];
}

export default function PostDetailScreen() {
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  const insets = useSafeAreaInsets();
  
  const { post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);

  // Interaction State
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const [structuredComments, setStructuredComments] = useState<ExtendedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Input State
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Reply & Edit State
  const [replyingTo, setReplyingTo] = useState<ExtendedComment | null>(null);
  const [editingComment, setEditingComment] = useState<ExtendedComment | null>(null);
  
  const [likesCount, setLikesCount] = useState(0); 
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Edit Post State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Image Viewer State
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // File name logic
  const displayFileName = 
    (post as any).fileName || 
    (post.fileUrl ? decodeURIComponent(post.fileUrl).split('/').pop() : 'Attachment');

  // Media type detection
  const isImage = 
    (post as any).fileType === 'image' || 
    (post.fileUrl && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(post.fileUrl));
  
  const isVideo = 
    (post as any).fileType === 'video' || 
    (post.fileUrl && /\.(mp4|mov|avi)$/i.test(post.fileUrl));
  
  const isOwner = currentUserId === post.userId;

  // --- Initial Data Fetching ---
  useEffect(() => {
    fetchComments();
    fetchInteractionStatus();
    fetchLikesCount();
  }, [post.id]);

  // Structure comments whenever raw list changes
  useEffect(() => {
    structureComments(comments);
  }, [comments]);

  const structureComments = (flatComments: ExtendedComment[]) => {
    const commentMap = new Map<string, ExtendedComment>();
    const roots: ExtendedComment[] = [];

    // 1. Initialize map
    flatComments.forEach(c => {
      commentMap.set(c.id, { ...c, replies: [] });
    });

    // 2. Build Tree
    flatComments.forEach(c => {
      const node = commentMap.get(c.id);
      if (node) {
        if (c.parent_id && commentMap.has(c.parent_id)) {
          commentMap.get(c.parent_id)!.replies!.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    setStructuredComments(roots);
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(id, full_name, avatar_url, program)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as ExtendedComment[]);
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

    const { data: likeData } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();
    setIsLiked(!!likeData);

    const { data: saveData } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('post_id', post.id)
      .eq('user_id', currentUserId)
      .single();
    setIsSaved(!!saveData);
  };

  // --- Post Actions ---
  const handleBack = () => navigation.goBack();

  const handleLike = async () => {
    if (!currentUserId) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(previousLiked ? likesCount - 1 : likesCount + 1);

    try {
      if (previousLiked) {
        await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId);
      } else {
        await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId });

        if (post.userId !== currentUserId) {
          await supabase.from('notifications').insert({
            user_id: post.userId, 
            actor_id: currentUserId, 
            type: 'like',
            title: 'New Like',
            content: 'Someone liked your post.',
            resource_id: post.id, // Ensure resource_id is here too
            is_read: false
          });
        }
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      if (previousSaved) {
        await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', currentUserId);
      } else {
        await supabase.from('saved_posts').insert({ post_id: post.id, user_id: currentUserId });
      }
    } catch (error) {
      setIsSaved(previousSaved);
    }
  };

  // --- Comment Actions ---

  const initiateReply = (comment: ExtendedComment) => {
    setReplyingTo(comment);
    setEditingComment(null);
    setCommentText('');
    inputRef.current?.focus();
  };

  const initiateEdit = (comment: ExtendedComment) => {
    if (comment.user_id !== currentUserId) return;
    setEditingComment(comment);
    setReplyingTo(null);
    setCommentText(comment.content);
    inputRef.current?.focus();
  };

  const cancelInputMode = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setCommentText('');
    Keyboard.dismiss();
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if(error) throw error;
            setComments(prev => prev.filter(c => c.id !== commentId));
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        }
      }
    ]);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUserId) return;
    setSendingComment(true);

    try {
      if (editingComment) {
        // --- Update Existing Comment ---
        const { data, error } = await supabase
          .from('comments')
          .update({ content: commentText.trim() })
          .eq('id', editingComment.id)
          .select('*, profiles(id, full_name, avatar_url, program)')
          .single();

        if (error) throw error;

        setComments(prev => prev.map(c => c.id === editingComment.id ? { ...c, content: data.content } : c));
        setEditingComment(null);

      } else {
        // --- Create New Comment (or Reply) ---
        const parentId = replyingTo ? replyingTo.id : null;
        
        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: post.id,
            user_id: currentUserId,
            content: commentText.trim(),
            parent_id: parentId
          })
          .select('*, profiles(id, full_name, avatar_url, program)')
          .single();

        if (error) throw error;

        setComments(prev => [...prev, data as ExtendedComment]);
        setReplyingTo(null);

        // Notifications
        if (post.userId !== currentUserId && !parentId) {
          await supabase.from('notifications').insert({
            user_id: post.userId,
            actor_id: currentUserId,
            type: 'comment',
            title: 'New Comment',
            content: `Commented: ${commentText.trim().substring(0, 50)}...`,
            resource_id: post.id, // <--- FIXED: Added resource_id to link notification to post
            is_read: false
          });
        }
      }
      
      setCommentText('');
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post comment.');
    } finally {
      setSendingComment(false);
    }
  };

  // --- Post Management Actions ---
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
        { text: 'Edit', onPress: () => { setEditTitle(post.title); setEditDescription(post.description); setIsEditing(true); }},
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Confirm', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: deletePost }]) },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } else {
      Alert.alert('Options', 'Select an action', [{ text: 'Report Post', onPress: () => console.log('Reported') }, { text: 'Cancel', style: 'cancel' }]);
    }
  };

  const handleViewAttachment = async () => {
    if (!post.fileUrl) return;
    try { await WebBrowser.openBrowserAsync(post.fileUrl); } catch (err) { Alert.alert('Error', 'Could not open the file.'); }
  };

  const handleSendPrivateMessage = () => {
    navigation.navigate('MessagesChat', {
      peerId: post.userId,
      peerName: post.authorName,
      peerInitials: post.authorInitials,
      peerAvatarUrl: post.authorAvatarUrl,
    });
  };

  // --- Render Functions ---
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
        <TextInput style={styles.editTitleInput} value={editTitle} onChangeText={setEditTitle} placeholder="Post Title" placeholderTextColor={COLORS.textTertiary} />
      ) : (
        <Text style={styles.postTitle}>{post.title}</Text>
      )}

      {isEditing ? (
        <TextInput style={styles.editDescInput} value={editDescription} onChangeText={setEditDescription} placeholder="What's on your mind?" placeholderTextColor={COLORS.textTertiary} multiline />
      ) : (
        <Text style={styles.postDescription}>{post.description}</Text>
      )}

      {isEditing && (
        <View style={styles.editButtonsRow}>
          <TouchableOpacity style={[styles.editButton, styles.cancelButton]} onPress={() => setIsEditing(false)} disabled={isSaving}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.editButton, styles.saveButton]} onPress={savePostEdit} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      )}

      {post.fileUrl && !isEditing && (
        <View style={styles.mediaContainer}>
          {isImage ? (
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
              <Image source={{ uri: post.fileUrl }} style={styles.postImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : isVideo ? (
            <Video style={styles.postImage} source={{ uri: post.fileUrl }} useNativeControls resizeMode={ResizeMode.CONTAIN} isLooping />
          ) : (
            <TouchableOpacity style={styles.attachment} onPress={handleViewAttachment} activeOpacity={0.7}>
              <View style={styles.attachmentIcon}>
                <Ionicons name="document-text" size={24} color="#5C6BC0" />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName} numberOfLines={1}>{displayFileName}</Text>
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
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.messageButtonGradient}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.messageButtonText}>Send Private Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} onPress={handleLike} activeOpacity={0.7}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? COLORS.error : "#9EA3AE"} />
              <Text style={styles.statNumber}>{likesCount}</Text>
            </TouchableOpacity>

            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={20} color="#9EA3AE" />
              <Text style={styles.statNumber}>{comments.length}</Text>
            </View>

            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.statItem} onPress={handleSave}>
              <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? COLORS.primary : "#9EA3AE"} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {!isEditing && <Text style={styles.repliesTitle}>Comments ({comments.length})</Text>}
    </View>
  );

  const renderCommentItem = (item: ExtendedComment, isReply = false) => {
    const isMyComment = item.user_id === currentUserId;
    const initials = item.profiles?.full_name 
      ? item.profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
      : '??';
    
    // Custom logic to make reply avatars noticeably smaller
    const avatarSize = isReply ? "custom" : "small"; 

    return (
      <View key={item.id} style={[styles.commentRow, isReply && styles.replyRow]}>
        {/* Avatar Column */}
        <View style={styles.avatarContainer}>
          {isReply ? (
            // Custom tiny avatar for replies to save space
            <View style={[styles.tinyAvatar, { backgroundColor: COLORS.primary }]}>
               <Text style={styles.tinyAvatarText}>{initials}</Text>
            </View>
          ) : (
            <Avatar initials={initials} avatarUrl={item.profiles?.avatar_url} size="small" />
          )}
        </View>

        {/* Content Column - Flex 1 ensures it stays within screen bounds */}
        <View style={styles.commentContent}>
          <View style={[styles.commentBubble, isReply && styles.replyBubble]}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor} numberOfLines={1}>{item.profiles?.full_name || 'Unknown'}</Text>
              {item.profiles?.program && (
                <View style={styles.programBadge}>
                  <Text style={styles.programText}>{item.profiles.program}</Text>
                </View>
              )}
            </View>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          
          <View style={styles.commentActions}>
            <Text style={styles.timestampText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            
            {!isReply && (
              <TouchableOpacity onPress={() => initiateReply(item)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Text style={styles.actionLink}>Reply</Text>
              </TouchableOpacity>
            )}

            {isMyComment && (
              <>
                <TouchableOpacity onPress={() => initiateEdit(item)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                  <Text style={styles.actionLink}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                  <Text style={[styles.actionLink, styles.deleteAction]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderCommentTree = ({ item }: { item: ExtendedComment }) => (
    <View>
      {renderCommentItem(item, false)}
      {item.replies && item.replies.map(reply => renderCommentItem(reply, true))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        ) : <View style={{ width: 40 }} />}
      </View>

      {/* Keyboard Fix: behavior='height' generally works best on Android for this layout */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          data={isEditing ? [] : structuredComments}
          keyExtractor={(item) => item.id}
          renderItem={renderCommentTree}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => Keyboard.dismiss()} // Hide keyboard on scroll
          refreshControl={
            <RefreshControl 
              refreshing={loadingComments} 
              onRefresh={() => { fetchComments(); fetchLikesCount(); }} 
            />
          }
          ListEmptyComponent={
            !loadingComments && !isEditing ? (
              <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
            ) : null
          }
        />

        {/* Comment Input */}
        {!isEditing && (
          <View style={[styles.commentSection, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            
            {/* Context Banner */}
            {(replyingTo || editingComment) && (
              <View style={styles.inputContext}>
                 <Text style={styles.contextText} numberOfLines={1}>
                    {replyingTo ? `Replying to ${replyingTo.profiles?.full_name}...` : 'Editing comment...'}
                 </Text>
                 <TouchableOpacity onPress={cancelInputMode}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                 </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder={replyingTo ? "Write a reply..." : "Add a public comment..."}
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
                  colors={editingComment ? [COLORS.secondary, COLORS.secondary] : GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButtonGradient}
                >
                  {sendingComment ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Ionicons name={editingComment ? "checkmark" : "arrow-up"} size={20} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal visible={imageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
        <RNSafeAreaView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeModalButton} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close-circle" size={40} color="#FFF" />
          </TouchableOpacity>
          {post.fileUrl && <Image source={{ uri: post.fileUrl }} style={styles.fullScreenImage} resizeMode="contain" />}
        </RNSafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F7F8FA', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1B2D' },
  moreButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F7F8FA', justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingBottom: 20 },
  
  // Post Card
  postCard: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 12, marginHorizontal: 16, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 16 },
  authorSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: '700', color: '#1A1B2D', marginBottom: 2 },
  timestamp: { fontSize: 13, color: '#9EA3AE', fontWeight: '500' },
  postTitle: { fontSize: 20, fontWeight: '700', color: '#1A1B2D', marginBottom: 12, lineHeight: 28 },
  postDescription: { fontSize: 15, color: '#525769', lineHeight: 24, marginBottom: 20 },
  
  // Inputs
  editTitleInput: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingVertical: 4 },
  editDescInput: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 22, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: 'top', backgroundColor: '#F9F9F9' },
  editButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginBottom: 16 },
  editButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, minWidth: 90, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: '#F0F0F0' },
  cancelButtonText: { color: '#666', fontWeight: '600', fontSize: 14 },
  saveButton: { backgroundColor: COLORS.primary },
  saveButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  // Media
  mediaContainer: { marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
  postImage: { width: '100%', height: 300, backgroundColor: '#F1F5F9' },
  attachment: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EAF6', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#C5CAE9' },
  attachmentIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  attachmentInfo: { flex: 1 },
  attachmentName: { fontSize: 15, fontWeight: '700', color: '#1A1B2D', marginBottom: 4 },
  attachmentSize: { fontSize: 13, color: '#9EA3AE' },
  
  // Interactions
  messageButton: { marginBottom: 24, borderRadius: 16, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  messageButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  messageButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  statNumber: { fontSize: 13, fontWeight: '600', color: '#9EA3AE', marginLeft: 4 },
  repliesTitle: { fontSize: 16, fontWeight: '700', color: '#525769', marginTop: 8, marginBottom: 8 },
  emptyCommentsText: { textAlign: 'center', color: '#9EA3AE', marginTop: 20 },

  // Comments & Replies (FIXED LAYOUT)
  commentRow: { flexDirection: 'row', marginBottom: 12, marginHorizontal: 16 },
  replyRow: { 
    marginLeft: 16, 
    borderLeftWidth: 2, 
    borderLeftColor: '#F0F0F0',
    paddingLeft: 8, // Tighter padding
  },
  
  avatarContainer: { marginRight: 12, alignItems: 'center' },
  tinyAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tinyAvatarText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  commentContent: { flex: 1 }, 
  
  commentBubble: { backgroundColor: '#F7F8FA', borderRadius: 16, padding: 12, alignSelf: 'flex-start' },
  replyBubble: { padding: 8, borderRadius: 12 }, // Smaller bubble for replies

  commentHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4, 
    flexWrap: 'wrap' // Ensures name + program wraps if too long
  },
  commentAuthor: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1A1B2D', 
    marginRight: 8, // Space between name and program
    flexShrink: 1 // Prevents name from pushing program off screen
  },
  programBadge: { backgroundColor: '#E0E0E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  programText: { fontSize: 10, fontWeight: '600', color: '#666' },
  commentText: { fontSize: 14, color: '#525769', lineHeight: 20 },
  
  // Comment Actions
  commentActions: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12, paddingLeft: 4 },
  timestampText: { fontSize: 12, color: '#9EA3AE' },
  actionLink: { fontSize: 12, fontWeight: '600', color: '#555' },
  deleteAction: { color: COLORS.error },

  // Input Section
  commentSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  inputContext: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#F5F5F5', padding: 8, borderRadius: 8 },
  contextText: { fontSize: 12, fontStyle: 'italic', color: '#666', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  commentInput: { flex: 1, backgroundColor: '#F7F8FA', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginRight: 12, maxHeight: 48 },
  sendButton: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  sendButtonGradient: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeModalButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  fullScreenImage: { width: '100%', height: '80%' },
});