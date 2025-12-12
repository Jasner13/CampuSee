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
  onlineUsers: Set<string>; // <--- ADDED: List of online user IDs
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
        setOnlineUsers(new Set()); // Clear online users
      } else if (newSession) {
        await fetchProfile(newSession);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Handle Presence (Active Status)
  useEffect(() => {
    if (!session?.user || !profile) return;

    // Helper to check if user wants to be seen
    // Default to true if setting is missing
    const isVisible = profile.settings?.active_status !== false;

    // Initialize Channel
    if (!channelRef.current) {
      channelRef.current = supabase.channel('global_presence', {
        config: {
          presence: {
            key: session.user.id,
          },
        },
      });

      channelRef.current
        .on('presence', { event: 'sync' }, () => {
          const newState = channelRef.current.presenceState();
          const userIds = new Set(Object.keys(newState));
          setOnlineUsers(userIds);
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            if (isVisible) {
              await channelRef.current.track({
                user_id: session.user.id,
                online_at: new Date().toISOString(),
              });
            }
          }
        });
    } else {
        // If profile settings changed (e.g. active_status toggled)
        if (isVisible) {
             channelRef.current.track({
                user_id: session.user.id,
                online_at: new Date().toISOString(),
             });
        } else {
             channelRef.current.untrack();
        }
    }

    // App State Listener (Background/Foreground)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (!channelRef.current) return;

        if (nextAppState === 'active' && isVisible) {
            channelRef.current.track({
                user_id: session.user.id,
                online_at: new Date().toISOString(),
            });
        } else if (nextAppState.match(/inactive|background/)) {
            channelRef.current.untrack();
        }
    });

    return () => {
        subscription.remove();
        // Don't remove channel on every render, only on unmount or logout logic
    };
  }, [session?.user?.id, profile?.settings?.active_status]);


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
    if (channelRef.current) {
        await channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
    }
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
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
        onlineUsers, // <--- Exposed to app
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