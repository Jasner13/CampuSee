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
  CreatePost: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
  PostDetail: { postId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
