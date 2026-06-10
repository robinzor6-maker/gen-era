import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/lib/types";

function formatPrice(price: number) {
  return price.toLocaleString("ar-EG") + " ج.م";
}

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, cartTotal, removeFromCart, updateQuantity } = useCart();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.row, { borderBottomColor: colors.border, backgroundColor: colors.obsidian }]}>
      <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.sand2 }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.price, { color: colors.fire }]}>{formatPrice(item.price)}</Text>
        <View style={styles.qtyRow}>
          <Pressable
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              updateQuantity(item.productId, item.quantity - 1);
            }}
          >
            <Feather name="minus" size={14} color={colors.sand} />
          </Pressable>
          <Text style={[styles.qty, { color: colors.sand }]}>{item.quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              updateQuantity(item.productId, item.quantity + 1);
            }}
          >
            <Feather name="plus" size={14} color={colors.sand} />
          </Pressable>
        </View>
      </View>
      <Pressable
        style={styles.removeBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          removeFromCart(item.productId);
        }}
      >
        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.sand }]}>CART</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="shopping-cart" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.sand }]}>Your cart is empty</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Browse the archive to find sacred artifacts
          </Text>
          <Pressable
            style={[styles.browseBtn, { borderColor: colors.sand }]}
            onPress={() => router.push("/store")}
          >
            <Text style={[styles.browseBtnText, { color: colors.sand }]}>BROWSE ARCHIVE</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.productId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <View style={[styles.summary, { borderTopColor: colors.border }]}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>TOTAL</Text>
                <Text style={[styles.totalPrice, { color: colors.sand }]}>{formatPrice(cartTotal)}</Text>
              </View>
              <Pressable
                style={[styles.checkoutBtn, { backgroundColor: colors.sand }]}
                onPress={() => router.push("/checkout")}
              >
                <Text style={[styles.checkoutText, { color: colors.void }]}>PROCEED TO CHECKOUT</Text>
              </Pressable>
            </View>
          }
        />
      )}
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", letterSpacing: 2 },
  emptySub: { fontSize: 14, textAlign: "center" },
  browseBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderWidth: 1,
  },
  browseBtnText: { fontSize: 12, letterSpacing: 3, fontWeight: "600" },
  list: { paddingBottom: Platform.OS === "web" ? 34 : 100 },
  row: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  thumb: { width: 80, height: 80, borderRadius: 2 },
  info: { flex: 1, gap: 6 },
  name: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  price: { fontSize: 14, fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: { borderWidth: 1, padding: 6, borderRadius: 2 },
  qty: { fontSize: 15, fontWeight: "600", minWidth: 24, textAlign: "center" },
  removeBtn: { padding: 4 },
  summary: {
    padding: 20,
    gap: 16,
    borderTopWidth: 1,
    margin: 16,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 11, letterSpacing: 3 },
  totalPrice: { fontSize: 22, fontWeight: "700" },
  checkoutBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  checkoutText: { fontSize: 13, letterSpacing: 3, fontWeight: "700" },
});
