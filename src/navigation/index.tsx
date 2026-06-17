import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ChampionDetailScreen from '../screens/ChampionDetailScreen';
import ChampionListScreen from '../screens/ChampionListScreen';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultScreen from '../screens/ResultScreen';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.accent,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'クイズ', headerBackTitle: '' }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChampionList" component={ChampionListScreen} options={{ title: 'チャンピオン図鑑', headerBackTitle: '' }} />
      <Stack.Screen
        name="ChampionDetail"
        component={ChampionDetailScreen}
        options={({ route }) => ({ title: route.params.championId, headerBackTitle: '' })}
      />
    </Stack.Navigator>
  );
}
