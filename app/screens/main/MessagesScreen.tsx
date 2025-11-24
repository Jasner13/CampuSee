import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import { MessageCard } from '../../components/cards/MessageCard';
import { BottomNav } from '../../components/BottomNav'; // <-- IMPORT BottomNav
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

    // --- Navigation Handlers for BottomNav ---
    const handleNavigate = (item: 'home' | 'messages' | 'notifications' | 'profile') => {
        const routeMap = {
            home: 'Home',
            messages: 'Messages',
            notifications: 'Notifications',
            profile: 'Profile',
        } as const;

        navigation.navigate(routeMap[item]);
    };

    const handleCreatePost = () => {
        // Assuming 'CreatePost' is a valid route
        navigation.navigate('CreatePost');
    };
    // ------------------------------------------

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    // Logic will be added later, currently just logging
    console.log('Search button pressed');
  };

  const handleMessagePress = (messageId: string) => {
    navigation.navigate('MessagesChat', { messageId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Messages</Text>

        {/* --- SEARCH BUTTON UI CHANGE --- */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.7}>
          <View style={styles.searchCircle}>
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              {/* This is the Search Path SVG from your previous code */}
              <Path d="M12.6667 21.3333C10.2444 21.3333 8.19467 20.4942 6.51733 18.816C4.84 17.1378 4.00089 15.088 4 12.6667C3.99911 10.2453 4.83822 8.19556 6.51733 6.51733C8.19645 4.83911 10.2462 4 12.6667 4C15.0871 4 17.1373 4.83911 18.8173 6.51733C20.4973 8.19556 21.336 10.2453 21.3333 12.6667C21.3333 13.6444 21.1778 14.5667 20.8667 15.4333C20.5556 16.3 20.1333 17.0667 19.6 17.7333L27.0667 25.2C27.3111 25.4444 27.4333 25.7556 27.4333 26.1333C27.4333 26.5111 27.3111 26.8222 27.0667 27.0667C26.8222 27.3111 26.5111 27.4333 26.1333 27.4333C25.7556 27.4333 25.4444 27.3111 25.2 27.0667L17.7333 19.6C17.0667 20.1333 16.3 20.5556 15.4333 20.8667C14.5667 21.1778 13.6444 21.3333 12.6667 21.3333ZM12.6667 18.6667C14.3333 18.6667 15.7502 18.0836 16.9173 16.9173C18.0844 15.7511 18.6676 14.3342 18.6667 12.6667C18.6658 10.9991 18.0827 9.58267 16.9173 8.41733C15.752 7.252 14.3351 6.66844 12.6667 6.66667C10.9982 6.66489 9.58178 7.24844 8.41733 8.41733C7.25289 9.58622 6.66933 11.0027 6.66667 12.6667C6.664 14.3307 7.24756 15.7476 8.41733 16.9173C9.58711 18.0871 11.0036 18.6702 12.6667 18.6667Z" fill="#64748B" />
            </Svg>
          </View>
        </TouchableOpacity>
        {/* ------------------------------------ */}
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

    {/* ADDED BOTTOM NAVBAR HERE */}
    <BottomNav
        selected="messages"
        onNavigate={handleNavigate}
        onCreatePost={handleCreatePost}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60, // Keep this for status bar spacing
    paddingBottom: 16,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF', // Using a light color for border
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  // --- Search Button Styles ---
  searchButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircle: {
    width: 40, // Slightly smaller than button for padding/effect
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background, // Should match background for the circle effect
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Cleaned up/Removed styles based on new UI structure ---
  messageList: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageListContent: {
    backgroundColor: COLORS.background,
    paddingBottom: 50
  },
  separator: {
    height: 2,
    backgroundColor: COLORS.background,
  },
  // Removed unused styles: markAllButton, markAllIcon, backCircle, title, searchButton (redefined above), searchCircle (redefined above)
});