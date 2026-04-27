// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../views/screens/WelcomeScreen';
import LoginScreen from '../views/screens/Loginscreen ';
import VerifyOtpScreen from '../views/screens/Verifyotpscreen';
import RegisterScreen from '../views/screens/Registerscreen';
import EmotionalEntryScreen from '../views/screens/EmotionEntryScreen';
import ChatScreen from '../views/screens/ChatScreen';
import {
  VoiceScreen,
  HumanEscalationScreen,
  MatchingScreen,
  HumanChatScreen,
  SessionEndScreen,
  ReflectionScreen,
  MemoryConsentScreen,
  HomeScreen,
  SubscriptionScreen,
} from '../views/screens/OtherScreens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          animationDuration: 350,
        }}
      >
        {/* ── Auth Flow ── */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ── Main App ── */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmotionalEntry" component={EmotionalEntryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Voice" component={VoiceScreen} />
        <Stack.Screen
          name="HumanEscalation"
          component={HumanEscalationScreen}
        />
        <Stack.Screen name="Matching" component={MatchingScreen} />
        <Stack.Screen name="HumanChat" component={HumanChatScreen} />
        <Stack.Screen name="SessionEnd" component={SessionEndScreen} />
        <Stack.Screen name="Reflection" component={ReflectionScreen} />
        <Stack.Screen name="MemoryConsent" component={MemoryConsentScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
