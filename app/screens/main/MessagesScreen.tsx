import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { MessageCard } from '../../components/cards/MessageCard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

type MessagesScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Messages'>;

interface Message {
  id: string;
  name: string;
  messagePreview: string;
  time: string;
  initials: string;
  isOnline: boolean;
  isUnread: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: true,
    isUnread: true,
  },
  {
    id: '2',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: false,
    isUnread: true,
  },
  {
    id: '3',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: false,
    isUnread: false,
  },
  {
    id: '4',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: true,
    isUnread: false,
  },
  {
    id: '5',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: false,
    isUnread: false,
  },
  {
    id: '6',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: true,
    isUnread: false,
  },
  {
    id: '7',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: true,
    isUnread: false,
  },
  {
    id: '8',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: true,
    isUnread: false,
  },
  {
    id: '9',
    name: 'First Last',
    messagePreview: 'Lorem ipsum dolor sit amet',
    time: '17:11',
    initials: 'XX',
    isOnline: true,
    isUnread: false,
  },
];

export default function MessagesScreen() {
  const navigation = useNavigation<MessagesScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    console.log('Search pressed');
  };

  const handleMessagePress = (messageId: string) => {
    navigation.navigate('MessagesChat', { messageId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      <View style={styles.statusBar}>
        <Text style={styles.time}>06:07</Text>
        <View style={styles.statusIcons}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M0 4.5525L2 6.5525C6.97 1.5825 15.03 1.5825 20 6.5525L22 4.5525C15.93 -1.5175 6.08 -1.5175 0 4.5525ZM8 12.5525L11 15.5525L14 12.5525C12.35 10.8925 9.66 10.8925 8 12.5525ZM4 8.5525L6 10.5525C8.76 7.7925 13.24 7.7925 16 10.5525L18 8.5525C14.14 4.6925 7.87 4.6925 4 8.5525Z"
              fill="#64748B"
              transform="translate(1, 4) scale(0.92)"
            />
          </Svg>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <G clipPath="url(#clip0)">
              <Path d="M2 22H22V2L2 22Z" fill="#64748B" />
            </G>
            <Defs>
              <ClipPath id="clip0">
                <Rect width={24} height={24} fill="white" />
              </ClipPath>
            </Defs>
          </Svg>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <G clipPath="url(#clip1)">
              <Path d="M15.67 4H14V2H10V4H8.33C7.6 4 7 4.6 7 5.33V20.66C7 21.4 7.6 22 8.33 22H15.66C16.4 22 17 21.4 17 20.67V5.33C17 4.6 16.4 4 15.67 4Z" fill="#64748B" />
            </G>
            <Defs>
              <ClipPath id="clip1">
                <Rect width={24} height={24} fill="white" />
              </ClipPath>
            </Defs>
          </Svg>
        </View>
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <View style={styles.backCircle}>
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.title}>Messages</Text>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.7}>
          <View style={styles.searchCircle}>
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Path d="M12.6667 21.3333C10.2444 21.3333 8.19467 20.4942 6.51733 18.816C4.84 17.1378 4.00089 15.088 4 12.6667C3.99911 10.2453 4.83822 8.19556 6.51733 6.51733C8.19645 4.83911 10.2462 4 12.6667 4C15.0871 4 17.1373 4.83911 18.8173 6.51733C20.4973 8.19556 21.336 10.2453 21.3333 12.6667C21.3333 13.6444 21.1778 14.5667 20.8667 15.4333C20.5556 16.3 20.1333 17.0667 19.6 17.7333L27.0667 25.2C27.3111 25.4444 27.4333 25.7556 27.4333 26.1333C27.4333 26.5111 27.3111 26.8222 27.0667 27.0667C26.8222 27.3111 26.5111 27.4333 26.1333 27.4333C25.7556 27.4333 25.4444 27.3111 25.2 27.0667L17.7333 19.6C17.0667 20.1333 16.3 20.5556 15.4333 20.8667C14.5667 21.1778 13.6444 21.3333 12.6667 21.3333ZM12.6667 18.6667C14.3333 18.6667 15.7502 18.0836 16.9173 16.9173C18.0844 15.7511 18.6676 14.3342 18.6667 12.6667C18.6658 10.9991 18.0827 9.58267 16.9173 8.41733C15.752 7.252 14.3351 6.66844 12.6667 6.66667C10.9982 6.66489 9.58178 7.24844 8.41733 8.41733C7.25289 9.58622 6.66933 11.0027 6.66667 12.6667C6.664 14.3307 7.24756 15.7476 8.41733 16.9173C9.58711 18.0871 11.0036 18.6702 12.6667 18.6667Z" fill="#64748B" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageCard
            name={item.name}
            messagePreview={item.messagePreview}
            time={item.time}
            initials={item.initials}
            isOnline={item.isOnline}
            isUnread={item.isUnread}
            onPress={() => handleMessagePress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusBar: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.backgroundLight,
  },
  time: {
    color: COLORS.textSecondary,
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  statusIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  topBar: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.backgroundLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  searchButton: {
    width: 44,
    height: 44,
  },
  searchCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageListContent: {
    backgroundColor: COLORS.background,
  },
  separator: {
    height: 2,
    backgroundColor: COLORS.background,
  },
});