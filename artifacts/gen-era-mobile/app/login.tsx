import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.void }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.navBar, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.sand} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.glyphRow}>
          <Text style={[styles.glyph, { color: colors.sand }]}>𓂀</Text>
        </View>
        <Text style={[styles.title, { color: colors.sand }]}>ACCESS THE ARCHIVE</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Sign in to place orders
        </Text>

        {error && (
          <View style={[styles.errorBox, { borderColor: colors.destructive, backgroundColor: "rgba(204,17,17,0.06)" }]}>
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.field, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Feather name="mail" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.sand }]}
            placeholder="Email"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.field, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Feather name="lock" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.sand }]}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
          />
          <Pressable onPress={() => setShowPw(!showPw)}>
            <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.sand }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.void} />
          ) : (
            <Text style={[styles.submitText, { color: colors.void }]}>SIGN IN</Text>
          )}
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>No account? </Text>
          <Pressable onPress={() => router.replace("/register")}>
            <Text style={[styles.switchLink, { color: colors.sand }]}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, alignSelf: "flex-start" },
  scroll: { padding: 24, gap: 16 },
  glyphRow: { alignItems: "center", paddingVertical: 20 },
  glyph: { fontSize: 56 },
  title: { fontSize: 20, fontWeight: "700", letterSpacing: 3, textAlign: "center" },
  sub: { fontSize: 13, textAlign: "center" },
  errorBox: { borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15 },
  submitBtn: { paddingVertical: 16, alignItems: "center" },
  submitText: { fontSize: 13, letterSpacing: 3, fontWeight: "700" },
  switchRow: { flexDirection: "row", justifyContent: "center", paddingTop: 8 },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "600" },
});
