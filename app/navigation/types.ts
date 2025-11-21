// navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  CodeVerification: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  MessagesChat: { messageId: string };
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
    interface RootParamList extends RootStackParamList {}
  }
}