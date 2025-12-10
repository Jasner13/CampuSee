import type { NavigatorScreenParams } from '@react-navigation/native';
import { Post } from '../components/cards/PostCard';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  CodeVerification: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  MessagesChat: {
    peerId: string;
    peerName: string;
    peerInitials: string;
    peerAvatarUrl?: string | null;
  };
  CreatePost: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  EditProfile: { isNewUser?: boolean } | undefined;
  ChangePassword: undefined;
  PostDetails: { post: Post };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  
 
  PostDetails: { post: Post };
  
 
  Settings: undefined;
  EditProfile: { isNewUser?: boolean } | undefined;
  ChangePassword: undefined;
  
  
  SetupProfile: { isNewUser: boolean };
  
  
  MessagesChat: {
    peerId: string;
    peerName: string;
    peerInitials: string;
    peerAvatarUrl?: string | null;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}