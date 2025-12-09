// navigation/types.ts
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
  };
  CreatePost: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PostDetails: { post: Post };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  PostDetail: { postId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}