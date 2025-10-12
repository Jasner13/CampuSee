import { StatusBar } from 'expo-status-bar';
import WelcomeScreen from './app/screens/auth/WelcomeScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <WelcomeScreen />
    </>
  );
}