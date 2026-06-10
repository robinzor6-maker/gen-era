import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { Product, ProductResponse } from "@/lib/types";

function formatPrice(price: number) {
  return price.toLocaleString("ar-EG") + " ج.م";
}

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<ProductResponse>(`/products/${slug}`);
        setProduct(res.data);
        setActiveImg(res.data.image);
      } catch (e: any) {
        setError(e.message || "Product not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAdd = () => {
    if (!product) return;
    if (product.stock === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Out of stock");
      return;
    }
    addToCart(product, qty);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Added to cart");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.void }]}>
        <View style={[styles.navBar, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.sand} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={colors.sand} size="large" />
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.root, { backgroundColor: colors.void }]}>
        <View style={[styles.navBar, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.sand} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error || "Not found"}</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: colors.sand }]}>← Back to Store</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const galleryImgs = [product.image, ...product.gallery.filter((g) => g !== product.image)];

  return (
    <View style={[styles.root, { backgroundColor: colors.void }]}>
      {/* Nav */}
      <View style={[styles.navBar, { paddingTop: topInset + 8, borderBottomColor: colors.border, backgroundColor: colors.void }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.sand} />
        </Pressable>
        <Pressable onPress={() => router.push("/cart")} style={styles.cartBtn}>
          <Feather name="shopping-cart" size={20} color={colors.sand} />
          {cartCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.fire }]}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Toast */}
      {toastMsg && (
        <View style={[styles.toast, { backgroundColor: colors.obsidian, borderColor: colors.border }]}>
          <Text style={[styles.toastText, { color: colors.sand2 }]}>{toastMsg}</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main image */}
        <Image source={{ uri: activeImg || product.image }} style={styles.mainImg} resizeMode="cover" />

        {/* Gallery thumbnails */}
        {galleryImgs.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {galleryImgs.map((img, i) => (
              <Pressable key={i} onPress={() => setActiveImg(img)}>
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.thumb,
                    { borderColor: activeImg === img ? colors.sand : colors.border },
                  ]}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.category, { color: colors.mutedForeground }]}>
            {product.category.toUpperCase()}
          </Text>
          <Text style={[styles.name, { color: colors.sand2 }]}>{product.name}</Text>
          <Text style={[styles.price, { color: colors.fire }]}>{formatPrice(product.price)}</Text>

          {product.stock > 0 ? (
            <Text style={[styles.stockText, { color: "#00ff88" }]}>
              {product.stock} in stock
            </Text>
          ) : (
            <Text style={[styles.stockText, { color: colors.destructive }]}>Out of stock</Text>
          )}

          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {product.shortDescription || product.description}
          </Text>

          {product.tags?.length > 0 && (
            <View style={styles.tags}>
              {product.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { borderColor: colors.border }]}>
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Qty + add */}
          {product.stock > 0 && (
            <View style={styles.qtyRow}>
              <Pressable
                style={[styles.qtyBtn, { borderColor: colors.border }]}
                onPress={() => setQty(Math.max(1, qty - 1))}
              >
                <Feather name="minus" size={16} color={colors.sand} />
              </Pressable>
              <Text style={[styles.qtyText, { color: colors.sand }]}>{qty}</Text>
              <Pressable
                style={[styles.qtyBtn, { borderColor: colors.border }]}
                onPress={() => setQty(Math.min(product.stock, qty + 1))}
              >
                <Feather name="plus" size={16} color={colors.sand} />
              </Pressable>
            </View>
          )}

          <Pressable
            style={[
              styles.addBtn,
              {
                backgroundColor: product.stock > 0 ? colors.sand : "transparent",
                borderColor: colors.sand,
              },
            ]}
            onPress={handleAdd}
            disabled={product.stock === 0}
          >
            <Text style={[styles.addBtnText, { color: product.stock > 0 ? colors.void : colors.mutedForeground }]}>
              {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </Text>
          </Pressable>

          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  cartBtn: { padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  toast: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 100,
  },
  toastText: { fontSize: 13, letterSpacing: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14 },
  backLink: { marginTop: 8 },
  backLinkText: { fontSize: 14 },
  mainImg: { width: "100%", aspectRatio: 0.9 },
  gallery: { paddingHorizontal: 16, paddingVertical: 12 },
  thumb: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderWidth: 2,
  },
  infoSection: { padding: 20, gap: 12 },
  category: { fontSize: 10, letterSpacing: 3 },
  name: { fontSize: 22, fontWeight: "700", lineHeight: 30 },
  price: { fontSize: 20, fontWeight: "700" },
  stockText: { fontSize: 12, letterSpacing: 1 },
  desc: { fontSize: 14, lineHeight: 22 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 10, letterSpacing: 1 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 4 },
  qtyBtn: { borderWidth: 1, padding: 10 },
  qtyText: { fontSize: 18, fontWeight: "700", minWidth: 32, textAlign: "center" },
  addBtn: {
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 4,
  },
  addBtnText: { fontSize: 13, letterSpacing: 3, fontWeight: "700" },
});
