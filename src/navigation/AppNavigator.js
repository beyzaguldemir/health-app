import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../auth/AuthContext';
import { COLORS } from '../constants/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SugarScreen from '../screens/SugarScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SurveyScreen from '../screens/SurveyScreen';
import FAQScreen from '../screens/FAQScreen';
import WeeklyPlanScreen from '../screens/WeeklyPlanScreen';
import BreathingExerciseScreen from '../screens/BreathingExerciseScreen';
import AIScreen from '../screens/AIScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const sharedHeaderStyle = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: 'bold' },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Activities: focused ? 'fitness' : 'fitness-outline',
          Insights: focused ? 'bar-chart' : 'bar-chart-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
        paddingBottom: 6,
        height: 62,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', paddingBottom: 2 },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Ana Sayfa' }} />
    <Tab.Screen name="Activities" component={ActivityScreen} options={{ tabBarLabel: 'Aktiviteler' }} />
    <Tab.Screen name="Insights" component={InsightsScreen} options={{ tabBarLabel: 'İçgörüler' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profilim' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Firebase 10 saniye içinde yanıt vermezse splash screen yine de kapanır
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !userProfile ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Sugar"
            component={SugarScreen}
            options={{ headerShown: true, title: 'Kan Şekeri Takibi', ...sharedHeaderStyle }}
          />
          <Stack.Screen
            name="Goals"
            component={GoalsScreen}
            options={{ headerShown: true, title: 'Günlük Hedefler', ...sharedHeaderStyle }}
          />
          <Stack.Screen
            name="Survey"
            component={SurveyScreen}
            options={{ headerShown: true, title: 'Risk Anketi', ...sharedHeaderStyle }}
          />
          <Stack.Screen
            name="FAQ"
            component={FAQScreen}
            options={{ headerShown: true, title: 'Sıkça Sorulan Sorular', ...sharedHeaderStyle }}
          />
          <Stack.Screen
            name="WeeklyPlan"
            component={WeeklyPlanScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BreathingExercise"
            component={BreathingExerciseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AI"
            component={AIScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
