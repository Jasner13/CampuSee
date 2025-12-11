import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { MessageCard } from '../../components/cards/MessageCard';
import { BottomNav } from '../../components/BottomNav';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/Avatar';
// IMPORT TYPES FROM CENTRAL SOURCE
import { ConversationView, Profile } from '../../types';

type MessagesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Messages'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function MessagesScreen() {
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const { session } = useAuth();

  // Use imported ConversationView type
  const [conversations, setConversations] = useState<ConversationView[]>([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  // Use imported Profile type
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

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
    navigation.navigate('CreatePost');
  };

  const handleBack = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchText('');
      setSearchResults([]);
      Keyboard.dismiss();
    } else {
      navigation.goBack();
    }
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      // Just opened search
    } else {
      // Closed search
      setSearchText('');
      setSearchResults([]);
    }
  };

  // --- 1. Fetch Conversations (Inbox) ---
  const fetchConversations = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('user_conversations')
        .select('*')
        .order('time', { ascending: false });

      if (error) throw error;
      if (data) setConversations(data as ConversationView[]);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Search Users Logic ---
  const handleSearchTextChange = async (text: string) => {
    setSearchText(text);
    if (text.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearchingLoading(true);
    try {
      // Search profiles by name
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session?.user.id) // Don't show myself
        .ilike('full_name', `%${text}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearchingLoading(false);
    }
  };

  // --- Navigation to Chat ---
  const openChat = (id: string, name: string | null, avatarUrl: string | null) => {
    const peerName = name || 'Unknown User';
    const peerInitials = peerName.substring(0, 2).toUpperCase();

    navigation.navigate('MessagesChat', {
      peerId: id,
      peerName: peerName,
      peerInitials: peerInitials,
      peerAvatarUrl: avatarUrl
    });
  };

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          const changedRecord = payload.new as any; 

          if (changedRecord && (changedRecord.sender_id === session?.user.id || changedRecord.receiver_id === session?.user.id)) {
            fetchConversations();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {isSearching ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchText}
            onChangeText={handleSearchTextChange}
            autoFocus
          />
        ) : (
          <Text style={styles.headerTitle}>Messages</Text>
        )}

        <TouchableOpacity style={styles.searchButton} onPress={toggleSearch} activeOpacity={0.7}>
          <View style={[styles.searchCircle, isSearching && styles.searchCircleActive]}>
            <Svg width={24} height={24} viewBox="0 0 32 32" fill="none">
              <Path d="M12.6667 21.3333C10.2444 21.3333 8.19467 20.4942 6.51733 18.816C4.84 17.1378 4.00089 15.088 4 12.6667C3.99911 10.2453 4.83822 8.19556 6.51733 6.51733C8.19645 4.83911 10.2462 4 12.6667 4C15.0871 4 17.1373 4.83911 18.8173 6.51733C20.4973 8.19556 21.336 10.2453 21.3333 12.6667C21.3333 13.6444 21.1778 14.5667 20.8667 15.4333C20.5556 16.3 20.1333 17.0667 19.6 17.7333L27.0667 25.2C27.3111 25.4444 27.4333 25.7556 27.4333 26.1333C27.4333 26.5111 27.3111 26.8222 27.0667 27.0667C26.8222 27.3111 26.5111 27.4333 26.1333 27.4333C25.7556 27.4333 25.4444 27.3111 25.2 27.0667L17.7333 19.6C17.0667 20.1333 16.3 20.5556 15.4333 20.8667C14.5667 21.1778 13.6444 21.3333 12.6667 21.3333ZM12.6667 18.6667C14.3333 18.6667 15.7502 18.0836 16.9173 16.9173C18.0844 15.7511 18.6676 14.3342 18.6667 12.6667C18.6658 10.9991 18.0827 9.58267 16.9173 8.41733C15.752 7.252 14.3351 6.66844 12.6667 6.66667C10.9982 6.66489 9.58178 7.24844 8.41733 8.41733C7.25289 9.58622 6.66933 11.0027 6.66667 12.6667C6.664 14.3307 7.24756 15.7476 8.41733 16.9173C9.58711 18.0871 11.0036 18.6702 12.6667 18.6667Z" fill={isSearching ? COLORS.primary : "#64748B"} />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.messageList}>
          {isSearchingLoading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userSearchCard}
                  onPress={() => openChat(item.id, item.full_name, item.avatar_url)}
                >
                  <View style={styles.searchAvatarContainer}>
                    <Avatar 
                      initials={getInitials(item.full_name)}
                      avatarUrl={item.avatar_url}
                      size="small"
                    />
                  </View>
                  <View>
                    <Text style={styles.searchName}>{item.full_name || 'No Name'}</Text>
                    <Text style={styles.searchProgram}>{item.program || 'Student'}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchText.length > 0 ? (
                  <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.textTertiary }}>No user found.</Text>
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.textTertiary }}>Type to search...</Text>
                )
              }
            />
          )}
        </View>
      ) : (
        loading ? (
          <View style={[styles.messageList, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.peer_id}
            renderItem={({ item }) => {
              const name = item.peer_name || 'Unknown';
              const initials = getInitials(name);
              const isUnread = item.receiver_id === session?.user.id && !item.is_read;

              return (
                <MessageCard
                  name={name}
                  messagePreview={item.last_message}
                  time={formatTime(item.time)}
                  initials={initials}
                  avatarUrl={item.peer_avatar}
                  isOnline={false}
                  isUnread={isUnread}
                  onPress={() => openChat(item.peer_id, item.peer_name, item.peer_avatar)}
                />
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text style={{ color: COLORS.textTertiary }}>No messages yet.</Text>
                <Text style={{ color: COLORS.primary, marginTop: 10, fontWeight: '600' }}>Tap the Search icon to find friends!</Text>
              </View>
            }
          />
        )
      )}

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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
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
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    fontSize: 16
  },
  searchButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircleActive: {
    backgroundColor: '#EEF2FF',
  },
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
  userSearchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchAvatarContainer: {
    marginRight: 12
  },
  searchName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  searchProgram: {
    fontSize: 12,
    color: COLORS.textSecondary
  }
});