import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { Svg, Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

type MessagesScreenChatNavigationProp = BottomTabNavigationProp<MainTabParamList, 'MessagesChat'>;

interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: 'Hello! Do you want to play gatcha life with me? No? 😅 ok... who am i anyway for you to say yes to that funny request. You can just leave me be and i\'ll be fine. Have a good one.',
    timestamp: '17:11',
    isSent: false,
  },
  {
    id: '2',
    text: 'Who is this?',
    timestamp: '17:15',
    isSent: true,
  },
  {
    id: '3',
    text: 'Wait sorry LOL wrong send. I was supposed to send this to sir Julian',
    timestamp: '17:16',
    isSent: false,
  },
  {
    id: '4',
    text: 'Actually',
    timestamp: '17:16',
    isSent: false,
  },
  {
    id: '5',
    text: 'Leave me alone',
    timestamp: '17:18',
    isSent: true,
  },
  {
    id: '6',
    text: 'or else',
    timestamp: '17:18',
    isSent: true,
  },
  {
    id: '7',
    text: 'im calling the police',
    timestamp: '17:18',
    isSent: true,
  },
];

export default function MessagesScreenChat() {
  const navigation = useNavigation<MessagesScreenChatNavigationProp>();
  const [messageText, setMessageText] = useState('');

  const handleBack = () => {
    navigation.navigate('Messages');
  };

  const handleSend = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.avatarContainer}>
            <LinearGradient 
              colors={GRADIENTS.primary} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>XX</Text>
            </LinearGradient>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>John Michael N. Villamor</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_CHAT_MESSAGES.map((message, index) => {
          const showTimestamp = index === 0 || 
            MOCK_CHAT_MESSAGES[index - 1]?.timestamp !== message.timestamp ||
            MOCK_CHAT_MESSAGES[index - 1]?.isSent !== message.isSent;

          return (
            <View key={message.id}>
              <View style={[
                styles.messageBubble,
                message.isSent ? styles.messageBubbleSent : styles.messageBubbleReceived
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isSent ? styles.messageTextSent : styles.messageTextReceived
                ]}>
                  {message.text}
                </Text>
              </View>
              {showTimestamp && (
                <Text style={[
                  styles.messageTimestamp,
                  message.isSent ? styles.messageTimestampSent : styles.messageTimestampReceived
                ]}>
                  {message.timestamp}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Message Input */}
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
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path d="M2.5 10L17.5 2.5L10 17.5L8.125 11.25L2.5 10Z" fill="white" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
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
    height: 130,
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