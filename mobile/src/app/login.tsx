import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>ICS</Text>

          <Text style={styles.title}>Insurance Claims System</Text>

          <Text style={styles.subtitle}>
            Sign in to manage your insurance claims.
          </Text>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isSubmitting}
              style={styles.input}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              editable={!isSubmitting}
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>SIGN IN</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1976d2",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    gap: 14,
  },
  input: {
    height: 52,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
  },
  button: {
    height: 52,
    backgroundColor: "#1976d2",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
