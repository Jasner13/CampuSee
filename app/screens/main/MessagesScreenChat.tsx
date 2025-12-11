import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Svg, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Message } from '../../types';

type MessagesScreenChatNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MessagesChat'>;
type MessagesScreenChatRouteProp = RouteProp<RootStackParamList, 'MessagesChat'>;

export default function MessagesScreenChat() {
  const navigation = useNavigation<MessagesScreenChatNavigationProp>();
  const route = useRoute<MessagesScreenChatRouteProp>();
  const { session } = useAuth();

  const { peerId, peerName, peerInitials, peerAvatarUrl } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const fetchMessages = async () => {
    if (!session?.user) return;

    // Fetch messages between me and the peer
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

  // Mark messages as read when we open the screen or receive new ones
  const markAsRead = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', session.user.id) // Messages sent TO me
      .eq('sender_id', peerId)          // Messages FROM this specific friend
      .eq('is_read', false);            // Only currently unread ones

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    markAsRead();

    // Subscribe to NEW messages where I am the receiver
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
          // If the message is from the person I'm currently chatting with
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !session?.user || sending) return;

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: textToSend,
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
      setMessageText(textToSend); // Restore text if failed
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarContainer}>
            <Avatar 
              initials={peerInitials} 
              avatarUrl={peerAvatarUrl} 
              size="default" 
            />
            {/* Note: Real "Online Status" requires Supabase Presence (Advanced feature). 
                Keeping the badge static or hidden for now is fine. */}
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{peerName}</Text>
            <Text style={styles.headerStatus}>Active</Text>
          </View>
        </View>
      </View>

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

            // Logic to group messages by time/sender to avoid repeating timestamps
            const showTimestamp = index === 0 ||
              new Date(messages[index - 1].created_at).getMinutes() !== new Date(message.created_at).getMinutes() ||
              messages[index - 1].sender_id !== message.sender_id;

            return (
              <View key={message.id}>
                <View style={[
                  styles.messageBubble,
                  isSentByMe ? styles.messageBubbleSent : styles.messageBubbleReceived
                ]}>
                  <Text style={[
                    styles.messageText,
                    isSentByMe ? styles.messageTextSent : styles.messageTextReceived
                  ]}>
                    {message.content}
                  </Text>
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
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Send a message..."
            placeholderTextColor={COLORS.lightGray}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!messageText.trim() || sending}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path d="M2.5 10L17.5 2.5L10 17.5L8.125 11.25L2.5 10Z" fill="white" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 30, 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
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
});