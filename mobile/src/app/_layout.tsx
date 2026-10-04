import { DarkTheme, DefaultTheme, Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { ThemeProvider } from "expo-router";

import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  SplashScreen.hideAsync();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerShadowVisible: false,
        headerTintColor: "#111827",
        headerTitleStyle: {
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: "#F7F8FA",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="claims/[id]"
        options={{
          title: "Claim Details",
        }}
      />

      <Stack.Screen
        name="claims/new"
        options={{
          title: "Submit Claim",
        }}
      />

      <Stack.Screen
        name="appointments"
        options={{
          title: "Appointment",
        }}
      />

      <Stack.Screen
        name="surveys"
        options={{
          title: "Survey / Assessment",
        }}
      />

      <Stack.Screen
        name="adjudication"
        options={{
          title: "Adjudication",
        }}
      />

      <Stack.Screen
        name="rental-vehicles"
        options={{
          title: "Rental Vehicle",
        }}
      />

      <Stack.Screen
        name="documents"
        options={{
          title: "Documents",
        }}
      />

      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />

      <Stack.Screen
        name="workshops"
        options={{
          title: "Workshops",
        }}
      />

      <Stack.Screen
        name="workshop-repair"
        options={{
          title: "Workshop Repair",
        }}
      />

      <Stack.Screen
        name="payment"
        options={{
          title: "Claim Payment",
        }}
      />

      <Stack.Screen
        name="policies"
        options={{
          title: "My Policies",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
