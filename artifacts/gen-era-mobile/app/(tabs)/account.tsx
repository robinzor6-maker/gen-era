import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuth();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.void,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.sand }]}>ACCOUNT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {isAuthenticated ? (
          <>
            {/* Profile card */}
            <View style={[styles.profileCard, { backgroundColor: colors.obsidian, borderColor: colors.border }]}>
              <View style={[styles.avatar, { borderColor: colors.sand }]}>
                <Text style={[styles.avatarGlyph, { color: colors.sand }]}>𓂀</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.sand2 }]}>{user?.name}</Text>
                <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
                {user?.role === "admin" && (
                  <View style={[styles.adminBadge, { backgroundColor: colors.fire }]}>
                    <Text style={styles.adminText}>ADMIN</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menu items */}
            <View style={[styles.menu, { borderColor: colors.border }]}>
              <Pressable
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => router.push("/checkout")}
              >
                <Feather name="shopping-bag" size={18} color={colors.sand} />
                <Text style={[styles.menuText, { color: colors.sand }]}>Place Order</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
              <Pressable
                style={[styles.menuItem, { borderBottomColor: "transparent" }]}
                onPress={handleLogout}
              >
                <Feather name="log-out" size={18} color={colors.fire} />
                <Text style={[styles.menuText, { color: colors.fire }]}>Sign Out</Text>
                <View />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.authState}>
            <Text style={[styles.authGlyph, { color: colors.sand }]}>𓂀</Text>
            <Text style={[styles.authTitle, { color: colors.sand }]}>ACCESS THE ARCHIVE</Text>
            <Text style={[styles.authSub, { color: colors.mutedForeground }]}>
              Sign in to place orders and track your artifacts
            </Text>
            <Pressable
              style={[styles.authBtn, { backgroundColor: colors.sand }]}
              onPress={() => router.push("/login")}
            >
              <Text style={[styles.authBtnText, { color: colors.void }]}>SIGN IN</Text>
            </Pressable>
            <Pressable
              style={[styles.authBtnOutline, { borderColor: colors.sand }]}
              onPress={() => router.push("/register")}
            >
              <Text style={[styles.authBtnOutlineText, { color: colors.sand }]}>CREATE ACCOUNT</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", letterSpacing: 4 },
  scroll: { padding: 20 },
  profileCard: {
    flexDirection: "row",
    gap: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlyph: { fontSize: 28 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontWeight: "700" },
  profileEmail: { fontSize: 13 },
  adminBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  adminText: { color: "#fff", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  menu: { borderWidth: 1 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderBottomWidth: 1,
  },
  menuText: { flex: 1, fontSize: 15, fontWeight: "500" },
  authState: { alignItems: "center", paddingTop: 60, gap: 16 },
  authGlyph: { fontSize: 64 },
  authTitle: { fontSize: 20, fontWeight: "700", letterSpacing: 3 },
  authSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  authBtn: { width: "100%", paddingVertical: 16, alignItems: "center", marginTop: 8 },
  authBtnText: { fontSize: 13, letterSpacing: 3, fontWeight: "700" },
  authBtnOutline: { width: "100%", paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  authBtnOutlineText: { fontSize: 13, letterSpacing: 3, fontWeight: "600" },
});
