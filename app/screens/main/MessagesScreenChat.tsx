import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  Keyboard,
  Image,
  Linking
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Svg, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Message } from '../../types';
import { Ionicons } from '@expo/vector-icons';

// --- File Handling Imports ---
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Video, ResizeMode } from 'expo-av';

type MessagesScreenChatNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MessagesChat'>;
type MessagesScreenChatRouteProp = RouteProp<RootStackParamList, 'MessagesChat'>;

// Max file size for chat (e.g., 10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function MessagesScreenChat() {
  const navigation = useNavigation<MessagesScreenChatNavigationProp>();
  const route = useRoute<MessagesScreenChatRouteProp>();
  const { session } = useAuth();

  const { peerId, peerName, peerInitials, peerAvatarUrl } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // --- Attachment State ---
  const [attachment, setAttachment] = useState<{
    uri: string;
    type: 'image' | 'video' | 'file';
    mimeType: string;
    name: string;
    size?: number;
    extension?: string;
  } | null>(null);

  // --- Keyboard State for Android Fix ---
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  // --- Keyboard Listener for Android Fix ---
  useEffect(() => {
    if (Platform.OS === 'android') {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
      });
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, []);

  const fetchMessages = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
      setLoading(false);
    } else if (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', session.user.id)
      .eq('sender_id', peerId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    markAsRead();

    const channel = supabase
      .channel(`chat:${peerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session?.user?.id}`
        },
        (payload) => {
          if (payload.new.sender_id === peerId) {
            setMessages((prev) => [...prev, payload.new as Message]);
            markAsRead(); 
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [peerId, session]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, attachment]);

  // --- Attachment Handlers ---

  const validateSize = (size?: number) => {
    if (size && size > MAX_FILE_SIZE) {
      Alert.alert("File Too Large", `Please choose a file smaller than 10MB.`);
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "We need access to your gallery to send photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false, 
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (!validateSize(asset.fileSize)) return;

      const type = asset.type === 'video' ? 'video' : 'image';
      const uriParts = asset.uri.split('.');
      const extension = uriParts[uriParts.length - 1];

      setAttachment({
        uri: asset.uri,
        type,
        mimeType: asset.mimeType || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
        name: asset.fileName || `media.${extension}`,
        size: asset.fileSize,
        extension
      });
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const file = result.assets[0];
        if (!validateSize(file.size)) return;

        const nameParts = file.name.split('.');
        const extension = nameParts.length > 1 ? nameParts.pop()! : 'bin';

        setAttachment({
          uri: file.uri,
          type: 'file',
          mimeType: file.mimeType || 'application/octet-stream',
          name: file.name,
          size: file.size,
          extension
        });
      }
    } catch (err) {
      console.log('Document picker error', err);
    }
  };

  const handleAttachmentButtonPress = () => {
    Alert.alert(
      "Send Attachment",
      "Choose what to send",
      [
        { text: "Photo or Video", onPress: pickMedia },
        { text: "Document", onPress: pickDocument },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const uploadAttachmentToSupabase = async (): Promise<string | null> => {
    if (!attachment || !session?.user) return null;

    try {
      const base64 = await FileSystem.readAsStringAsync(attachment.uri, {
        encoding: 'base64',
      });
      
      const arrayBuffer = decode(base64);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${attachment.extension || 'bin'}`;
      const filePath = `chat/${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, arrayBuffer, {
          contentType: attachment.mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
      return data.publicUrl;

    } catch (error) {
      console.error('File upload failed:', error);
      Alert.alert('Upload Failed', 'There was an error uploading your file. Please try again.');
      return null;
    }
  };

  // --- Send Message ---

  const handleSend = async () => {
    if ((!messageText.trim() && !attachment) || !session?.user || sending) return;

    setSending(true);
    let finalContent = messageText.trim();
    const tempAttachment = attachment; 

    setMessageText('');
    setAttachment(null);

    try {
      if (tempAttachment) {
        const publicUrl = await uploadAttachmentToSupabase();
        
        if (!publicUrl) {
            setMessageText(finalContent);
            setAttachment(tempAttachment);
            setSending(false);
            return;
        }

        const attachmentData = {
            type: tempAttachment.type,
            url: publicUrl,
            name: tempAttachment.name,
            size: tempAttachment.size,
            caption: finalContent
        };
        
        finalContent = JSON.stringify(attachmentData);
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: finalContent,
          sender_id: session.user.id,
          receiver_id: peerId,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [...prev, data as Message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (!attachment) setMessageText(finalContent); 
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handlePostPress = async (postId: string) => {
    if (!postId) return;
    try {
        const { data: postData, error } = await supabase
            .from('posts')
            .select(`*, profiles!posts_user_id_fkey (full_name, avatar_url, program)`)
            .eq('id', postId)
            .single();
        
        if (error || !postData) {
            Alert.alert("Unavailable", "This post is unavailable.");
            return;
        }

        const formattedPost = {
            id: postData.id,
            userId: postData.user_id,
            authorName: postData.profiles?.full_name || 'Unknown',
            authorInitials: postData.profiles?.full_name ? postData.profiles.full_name.substring(0,2).toUpperCase() : '??',
            authorAvatarUrl: postData.profiles?.avatar_url,
            timestamp: new Date(postData.created_at).toLocaleDateString(),
            label: postData.profiles?.program || 'Student', 
            title: postData.title,
            description: postData.description,
            category: postData.category,
            fileUrl: postData.file_url,
        };

        // @ts-ignore
        navigation.navigate('PostDetails', { post: formattedPost });
    } catch (err) {
        Alert.alert("Error", "Could not open the post.");
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- Render Content Logic ---

  const renderMessageContent = (content: string, isSentByMe: boolean) => {
      try {
          if (content && content.trim().startsWith('{')) {
              const parsed = JSON.parse(content);

              // 1. Shared Post (Updated for Preview of Images, Videos, and Documents)
              if (parsed.type === 'share_post') {
                  const fileUrl = parsed.thumbnail;
                  
                  // Helper to get extension
                  const getExt = (url: string) => url?.split('?')[0]?.split('.')?.pop()?.toLowerCase() || '';
                  const ext = getExt(fileUrl);
                  
                  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
                  const isVideo = ['mp4', 'mov', 'avi', '3gp'].includes(ext);
                  // If it has a URL but isn't image/video, assume it's a document
                  const isDocument = fileUrl && !isImage && !isVideo;

                  return (
                      <TouchableOpacity 
                        style={styles.sharedPostContainer}
                        onPress={() => handlePostPress(parsed.postId)}
                        activeOpacity={0.9}
                      >
                          <View style={styles.sharedPostHeader}>
                              <Ionicons name="share-social" size={16} color={isSentByMe ? '#FFF' : COLORS.primary} />
                              <Text style={[styles.sharedPostLabel, isSentByMe ? {color:'#FFF'} : {color: COLORS.primary}]}>
                                  Shared a Post
                              </Text>
                          </View>
                          <View style={styles.sharedPostCard}>
                              {/* Preview Image */}
                              {fileUrl && isImage && (
                                  <Image 
                                    source={{ uri: fileUrl }} 
                                    style={styles.sharedPostImage} 
                                    resizeMode="cover"
                                  />
                              )}
                              
                              {/* Preview Video */}
                              {fileUrl && isVideo && (
                                  <View style={[styles.sharedPostImage, styles.sharedPostVideoPlaceholder]}>
                                      <Ionicons name="play-circle" size={32} color="white" />
                                  </View>
                              )}

                              {/* Preview Document */}
                              {fileUrl && isDocument && (
                                  <View style={styles.sharedPostFileContainer}>
                                      <View style={styles.sharedPostFileIcon}>
                                          <Ionicons name="document-text" size={24} color={COLORS.primary} />
                                      </View>
                                      <Text style={styles.sharedPostFileName} numberOfLines={1}>
                                          {decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] || 'Attachment')}
                                      </Text>
                                  </View>
                              )}

                              <Text numberOfLines={1} style={styles.sharedPostTitle}>{parsed.title}</Text>
                              <Text numberOfLines={2} style={styles.sharedPostDesc}>{parsed.description}</Text>
                              <Text style={styles.sharedPostCta}>Tap to view</Text>
                          </View>
                      </TouchableOpacity>
                  );
              }

              // 2. Direct Image Attachment
              if (parsed.type === 'image') {
                  return (
                      <View>
                        <Image source={{ uri: parsed.url }} style={styles.messageImage} />
                        {parsed.caption ? (
                            <Text style={[styles.messageText, { marginTop: 8 }, isSentByMe ? styles.messageTextSent : styles.messageTextReceived]}>
                                {parsed.caption}
                            </Text>
                        ) : null}
                      </View>
                  );
              }

              // 3. Direct Video Attachment
              if (parsed.type === 'video') {
                  return (
                      <View style={{ width: 200 }}>
                         <Video
                            source={{ uri: parsed.url }}
                            style={styles.messageVideo}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping={false}
                         />
                         {parsed.caption ? (
                            <Text style={[styles.messageText, { marginTop: 8 }, isSentByMe ? styles.messageTextSent : styles.messageTextReceived]}>
                                {parsed.caption}
                            </Text>
                         ) : null}
                      </View>
                  );
              }

              // 4. Direct File Attachment
              if (parsed.type === 'file') {
                  return (
                      <View>
                          <TouchableOpacity 
                            style={[styles.fileCard, isSentByMe ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: '#E5E7EB' }]}
                            onPress={() => Linking.openURL(parsed.url)}
                          >
                              <Ionicons name="document-text" size={24} color={isSentByMe ? '#FFF' : COLORS.primary} />
                              <View style={{flex: 1}}>
                                  <Text style={[styles.fileName, isSentByMe ? {color:'#FFF'} : {color:'#000'}]} numberOfLines={1}>
                                      {parsed.name}
                                  </Text>
                                  <Text style={[styles.fileSize, isSentByMe ? {color:'rgba(255,255,255,0.8)'} : {color:'#6B7280'}]}>
                                      {(parsed.size / 1024).toFixed(1)} KB
                                  </Text>
                              </View>
                              <Ionicons name="download-outline" size={20} color={isSentByMe ? '#FFF' : COLORS.textSecondary} />
                          </TouchableOpacity>
                          {parsed.caption ? (
                            <Text style={[styles.messageText, { marginTop: 8 }, isSentByMe ? styles.messageTextSent : styles.messageTextReceived]}>
                                {parsed.caption}
                            </Text>
                         ) : null}
                      </View>
                  );
              }
          }
      } catch (e) {
          // Not JSON
      }

      // Default Text
      return (
        <Text style={[
            styles.messageText,
            isSentByMe ? styles.messageTextSent : styles.messageTextReceived
          ]}>
            {content}
          </Text>
      );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarContainer}>
            <Avatar initials={peerInitials} avatarUrl={peerAvatarUrl} size="default" />
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{peerName}</Text>
            <Text style={styles.headerStatus}>Active</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        enabled={Platform.OS === 'ios' ? true : isKeyboardVisible}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -30}
      >
        {loading ? (
          <View style={[styles.chatContainer, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => {
              const isSentByMe = message.sender_id === session?.user?.id;
              const showTimestamp = index === 0 ||
                new Date(messages[index - 1].created_at).getMinutes() !== new Date(message.created_at).getMinutes() ||
                messages[index - 1].sender_id !== message.sender_id;

              return (
                <View key={message.id}>
                  <View style={[
                    styles.messageBubble,
                    isSentByMe ? styles.messageBubbleSent : styles.messageBubbleReceived
                  ]}>
                    {renderMessageContent(message.content, isSentByMe)}
                  </View>
                  {showTimestamp && (
                    <Text style={[
                      styles.messageTimestamp,
                      isSentByMe ? styles.messageTimestampSent : styles.messageTimestampReceived
                    ]}>
                      {formatTime(message.created_at)}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.inputContainer}>
          {/* Attachment Preview */}
          {attachment && (
            <View style={styles.attachmentPreview}>
                <View style={styles.attachmentInfo}>
                    {attachment.type === 'image' ? (
                        <Image source={{ uri: attachment.uri }} style={styles.previewThumb} />
                    ) : attachment.type === 'video' ? (
                        <View style={[styles.previewThumb, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                             <Ionicons name="videocam" size={20} color="#FFF" />
                        </View>
                    ) : (
                        <View style={[styles.previewThumb, { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }]}>
                             <Ionicons name="document-text" size={24} color={COLORS.primary} />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.previewName} numberOfLines={1}>{attachment.name}</Text>
                        <Text style={styles.previewSize}>
                           {attachment.size ? (attachment.size / 1024 / 1024).toFixed(2) : '0'} MB
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setAttachment(null)} style={styles.removeAttachment}>
                    <Ionicons name="close-circle" size={24} color={COLORS.textTertiary} />
                </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputWrapper}>
            {/* Attachment Button */}
            <TouchableOpacity 
                style={styles.attachButton}
                onPress={handleAttachmentButtonPress}
                disabled={sending}
            >
                <Ionicons name="add" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={attachment ? "Add a caption..." : "Send a message..."}
              placeholderTextColor={COLORS.lightGray}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!messageText.trim() && !attachment || sending) && { opacity: 0.5 }]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={(!messageText.trim() && !attachment) || sending}
            >
              {sending ? (
                  <ActivityIndicator size="small" color="#FFF" />
              ) : (
                  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                    <Path d="M2.5 10L17.5 2.5L10 17.5L8.125 11.25L2.5 10Z" fill="white" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: 50
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 13,
    color: COLORS.success,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  messageBubbleReceived: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1D5DB',
    borderBottomLeftRadius: 4,
  },
  messageBubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.success,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextReceived: {
    color: COLORS.textPrimary,
  },
  messageTextSent: {
    color: COLORS.textLight,
  },
  messageTimestamp: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 12,
  },
  messageTimestampReceived: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  messageTimestampSent: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  inputContainer: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    minHeight: 80, 
    paddingBottom: 50, 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 8, 
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attachButton: {
      padding: 10,
      marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // --- Shared Post Styles ---
  sharedPostContainer: {
      minWidth: 200,
  },
  sharedPostHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  sharedPostLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
  },
  sharedPostCard: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
  },
  sharedPostImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: '#F1F5F9',
  },
  sharedPostVideoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
  },
  // New Styles for Document Preview in Share Post
  sharedPostFileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
  },
  sharedPostFileIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },
  sharedPostFileName: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textPrimary,
  },
  sharedPostTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1A1B2D',
      marginBottom: 4,
  },
  sharedPostDesc: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 8,
  },
  sharedPostCta: {
      fontSize: 10,
      color: COLORS.primary,
      fontWeight: '600',
      alignSelf: 'flex-end',
  },
  // --- New Attachment Styles ---
  messageImage: {
      width: 200,
      height: 200,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.1)',
      resizeMode: 'cover',
  },
  messageVideo: {
      width: 200,
      height: 150,
      borderRadius: 12,
      backgroundColor: '#000',
  },
  fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      borderRadius: 12,
      minWidth: 200,
  },
  fileName: {
      fontSize: 14,
      fontWeight: '600',
  },
  fileSize: {
      fontSize: 12,
  },
  attachmentPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
  },
  attachmentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
  },
  previewThumb: {
      width: 40,
      height: 40,
      borderRadius: 6,
  },
  previewName: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textPrimary,
  },
  previewSize: {
      fontSize: 12,
      color: COLORS.textTertiary,
  },
  removeAttachment: {
      padding: 4,
  }
});