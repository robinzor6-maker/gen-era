import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { Order, OrderResponse } from "@/lib/types";

function formatPrice(price: number) {
  return price.toLocaleString("ar-EG") + " ج.م";
}

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { items, cartTotal, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError("All fields except notes are required.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<OrderResponse>("/orders", {
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        notes: notes.trim(),
      });
      if (res.success) {
        setOrder(res.data);
        clearCart();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <View style={[styles.root, { backgroundColor: colors.void }]}>
        <View style={styles.successState}>
          <Text style={[styles.successGlyph, { color: colors.sand }]}>𓂀</Text>
          <Text style={[styles.successTitle, { color: colors.sand }]}>ORDER CONFIRMED</Text>
          <Text style={[styles.successOrderNum, { color: colors.fire }]}>#{order.orderNumber}</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your sacred artifacts are being prepared for dispatch. We'll contact you at {order.customer.email}.
          </Text>
          <Pressable
            style={[styles.homeBtn, { backgroundColor: colors.sand }]}
            onPress={() => router.replace("/")}
          >
            <Text style={[styles.homeBtnText, { color: colors.void }]}>RETURN TO TEMPLE</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.void }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.navBar, { paddingTop: topInset + 8, borderBottomColor: colors.border, backgroundColor: colors.void }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.sand} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.sand }]}>CHECKOUT</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!isAuthenticated && (
          <View style={[styles.guestNote, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.guestNoteText, { color: colors.mutedForeground }]}>
              Ordering as guest.{" "}
              <Text style={{ color: colors.sand }} onPress={() => router.push("/login")}>
                Sign in
              </Text>{" "}
              to link this order to your account.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DELIVERY DETAILS</Text>

        {error && (
          <View style={[styles.errorBox, { borderColor: colors.destructive, backgroundColor: "rgba(204,17,17,0.06)" }]}>
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        {[
          { label: "Full Name", value: name, set: setName, key: "name" },
          { label: "Email", value: email, set: setEmail, key: "email", keyboard: "email-address" as const },
          { label: "Phone", value: phone, set: setPhone, key: "phone", keyboard: "phone-pad" as const },
          { label: "Address", value: address, set: setAddress, key: "address" },
          { label: "City", value: city, set: setCity, key: "city" },
          { label: "Notes (optional)", value: notes, set: setNotes, key: "notes" },
        ].map((f) => (
          <View key={f.key} style={[styles.field, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.sand }]}
              value={f.value}
              onChangeText={f.set}
              placeholderTextColor={colors.mutedForeground}
              // @ts-ignore
              keyboardType={f.keyboard || "default"}
            />
          </View>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>ORDER SUMMARY</Text>
        <View style={[styles.summary, { borderColor: colors.border, backgroundColor: colors.obsidian }]}>
          {items.map((item) => (
            <View key={item.productId} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryName, { color: colors.sand2 }]} numberOfLines={1}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.fire }]}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>TOTAL</Text>
            <Text style={[styles.total, { color: colors.sand }]}>{formatPrice(cartTotal)}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.sand }]}
          onPress={handleSubmit}
          disabled={loading || items.length === 0}
        >
          {loading ? (
            <ActivityIndicator color={colors.void} />
          ) : (
            <Text style={[styles.submitText, { color: colors.void }]}>PLACE ORDER</Text>
          )}
        </Pressable>

        <View style={{ height: Platform.OS === "web" ? 34 : 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  navTitle: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "700", letterSpacing: 3 },
  scroll: { padding: 20, gap: 14 },
  sectionLabel: { fontSize: 10, letterSpacing: 3 },
  guestNote: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  guestNoteText: { flex: 1, fontSize: 13, lineHeight: 20 },
  errorBox: { borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13 },
  field: { borderWidth: 1, padding: 14 },
  fieldLabel: { fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  fieldInput: { fontSize: 15 },
  summary: { borderWidth: 1, overflow: "hidden" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  summaryName: { flex: 1, fontSize: 13, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: "700" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    alignItems: "center",
  },
  totalLabel: { fontSize: 10, letterSpacing: 3 },
  total: { fontSize: 20, fontWeight: "700" },
  submitBtn: { paddingVertical: 16, alignItems: "center" },
  submitText: { fontSize: 13, letterSpacing: 3, fontWeight: "700" },
  successState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  successGlyph: { fontSize: 72 },
  successTitle: { fontSize: 20, fontWeight: "700", letterSpacing: 3 },
  successOrderNum: { fontSize: 18, fontWeight: "700" },
  successSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  homeBtn: { marginTop: 16, paddingHorizontal: 32, paddingVertical: 14 },
  homeBtnText: { fontSize: 13, letterSpacing: 3, fontWeight: "700" },
});
