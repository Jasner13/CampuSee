import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  onlineUsers: Set<string>; 
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
  resendOtp: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Presence State
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<any>(null);
  const isTrackedRef = useRef(false); // Prevents duplicate track calls

  // 1. Fetch Profile
  const fetchProfile = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error);
      setProfile(null);
    }
  };

  // 2. Initialize Auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        await fetchProfile(initialSession);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (_event === 'SIGNED_OUT') {
        setProfile(null);
        setOnlineUsers(new Set());
      } else if (newSession) {
        await fetchProfile(newSession);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Setup Presence Channel (Subscribing to others)
  useEffect(() => {
    if (!session?.user) {
        // Clear online users if logged out
        setOnlineUsers(new Set());
        return;
    }

    // Only create channel if it doesn't exist
    if (!channelRef.current) {
        const channel = supabase.channel('global_presence', {
            config: {
                presence: {
                    key: session.user.id,
                },
            },
        });

        channel.on('presence', { event: 'sync' }, () => {
            const newState = channel.presenceState();
            // Object keys are the 'presence.key' (user_ids) we set in config
            const userIds = new Set(Object.keys(newState));
            setOnlineUsers(userIds);
        });

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Trigger initial presence check once subscribed
                handlePresenceLogic();
            }
        });

        channelRef.current = channel;
    }

    // Cleanup on unmount or session change (handled by effect dependency)
    return () => {
        if (channelRef.current) {
            channelRef.current.unsubscribe();
            channelRef.current = null;
            isTrackedRef.current = false;
        }
    };
  }, [session?.user?.id]);

  // 4. Handle Self Presence (Tracking) & DB Sync
  const handlePresenceLogic = async () => {
      if (!channelRef.current || !session?.user || !profile) return;

      const isAppActive = AppState.currentState === 'active';
      // Default to visible if setting is undefined
      const userWantsToBeVisible = profile.settings?.active_status !== false;
      
      const shouldBeOnline = isAppActive && userWantsToBeVisible;

      if (shouldBeOnline) {
          if (!isTrackedRef.current) {
              const status = await channelRef.current.track({
                  online_at: new Date().toISOString(),
                  user_id: session.user.id
              });
              
              if (status === 'ok') {
                  isTrackedRef.current = true;
              }
          }
      } else {
          if (isTrackedRef.current) {
              await channelRef.current.untrack();
              isTrackedRef.current = false;
              
              // If going offline/invisible, update last_seen in DB
              updateLastSeen();
          }
      }
  };

  const updateLastSeen = async () => {
      if (!session?.user) return;
      try {
          await supabase.from('profiles').update({
              last_seen: new Date().toISOString()
          }).eq('id', session.user.id);
      } catch (err) {
          console.error("Failed to update last_seen", err);
      }
  };

  // Trigger presence logic when:
  // 1. Profile settings change (user toggles active status)
  // 2. App State changes (background/foreground)
  useEffect(() => {
      handlePresenceLogic();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
          handlePresenceLogic();
      });

      return () => {
          subscription.remove();
      };
  }, [profile?.settings?.active_status, session?.user?.id]);


  // Auth Actions
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    return { error };
  };

  const resendOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'campusee://reset-password' });
    return { error };
  };

  const logout = async () => {
    // Untrack before signing out to ensure immediate "offline" status
    if (channelRef.current && isTrackedRef.current) {
        await channelRef.current.untrack();
        await updateLastSeen(); // Save timestamp one last time
    }
    
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
    }
    
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setOnlineUsers(new Set());
  };

  const refreshProfile = async () => {
    await fetchProfile(session);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isAuthenticated: !!session,
        onlineUsers, 
        login,
        signup,
        verifyOtp,
        resendOtp,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};