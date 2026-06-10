import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { Product, ProductListResponse } from "@/lib/types";

function formatPrice(price: number) {
  return price.toLocaleString("ar-EG") + " ج.م";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToCart, cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          api.get<ProductListResponse>("/products", { limit: "6" }),
          api.get<ProductListResponse>("/products/featured"),
        ]);
        setProducts(pRes.data || []);
        setFeatured(fRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Out of stock");
      return;
    }
    addToCart(product);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Added to cart");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

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
        <View style={styles.headerLogo}>
          <Text style={[styles.eyeGlyph, { color: colors.sand }]}>𓂀</Text>
          <Text style={[styles.logoText, { color: colors.sand }]}>
            GEN <Text style={{ color: colors.fire }}>ERA</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/cart")}
          style={styles.cartBtn}
        >
          <Feather name="shopping-cart" size={20} color={colors.sand} />
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.fire }]}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.sand} size="large" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={[styles.hero, { borderBottomColor: colors.border }]}>
            <Text style={[styles.heroEyebrow, { color: colors.mutedForeground }]}>
              THE TEMPLE OF COMMERCE
            </Text>
            <Text style={[styles.heroTitle, { color: colors.sand }]}>
              ARCHIVE OF{"\n"}
              <Text style={{ color: colors.fire }}>SACRED ARTIFACTS</Text>
            </Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              Ancient wisdom meets contemporary culture
            </Text>
            <Pressable
              style={[styles.heroBtn, { borderColor: colors.sand }]}
              onPress={() => router.push("/store")}
            >
              <Text style={[styles.heroBtnText, { color: colors.sand }]}>ENTER ARCHIVE</Text>
            </Pressable>
          </View>

          {/* Featured */}
          {featured.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                FEATURED ARTIFACTS
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                {featured.map((p) => (
                  <Pressable
                    key={p._id}
                    style={[styles.featuredCard, { backgroundColor: colors.obsidian, borderColor: colors.border }]}
                    onPress={() => router.push(`/product/${p.slug}`)}
                  >
                    <Image source={{ uri: p.image }} style={styles.featuredImg} resizeMode="cover" />
                    <View style={styles.featuredInfo}>
                      <Text style={[styles.featuredName, { color: colors.sand2 }]} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={[styles.featuredPrice, { color: colors.fire }]}>
                        {formatPrice(p.price)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Product Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                LATEST ARTIFACTS
              </Text>
              <Pressable onPress={() => router.push("/store")}>
                <Text style={[styles.seeAll, { color: colors.sand }]}>View All</Text>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {products.map((p) => (
                <Pressable
                  key={p._id}
                  style={[styles.productCard, { backgroundColor: colors.obsidian, borderColor: colors.border }]}
                  onPress={() => router.push(`/product/${p.slug}`)}
                >
                  <Image source={{ uri: p.image }} style={styles.productImg} resizeMode="cover" />
                  {p.stock === 0 && (
                    <View style={styles.outOfStock}>
                      <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.sand2 }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={[styles.productPrice, { color: colors.fire }]}>
                      {formatPrice(p.price)}
                    </Text>
                    <Pressable
                      style={[
                        styles.addBtn,
                        {
                          backgroundColor: p.stock === 0 ? "transparent" : colors.sand,
                          borderColor: colors.sand,
                        },
                      ]}
                      onPress={() => handleAddToCart(p)}
                    >
                      <Text
                        style={[
                          styles.addBtnText,
                          { color: p.stock === 0 ? colors.mutedForeground : colors.void },
                        ]}
                      >
                        {p.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeGlyph: { fontSize: 22 },
  logoText: { fontSize: 16, fontWeight: "700", letterSpacing: 3 },
  cartBtn: { padding: 4, position: "relative" },
  cartBadge: {
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
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 100,
  },
  toastText: { fontSize: 13, letterSpacing: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 20 },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  heroEyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: "700", letterSpacing: 2, textAlign: "center", lineHeight: 36 },
  heroSub: { fontSize: 13, marginTop: 12, letterSpacing: 1 },
  heroBtn: {
    marginTop: 24,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  heroBtnText: { fontSize: 12, letterSpacing: 3, fontWeight: "600" },
  section: { paddingTop: 28, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionLabel: { fontSize: 10, letterSpacing: 3, marginBottom: 12 },
  seeAll: { fontSize: 12, letterSpacing: 1 },
  featuredScroll: { marginHorizontal: -16 },
  featuredCard: {
    width: 160,
    marginLeft: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  featuredImg: { width: 160, height: 160 },
  featuredInfo: { padding: 10 },
  featuredName: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  featuredPrice: { fontSize: 13, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  productCard: {
    width: "48%",
    borderWidth: 1,
    overflow: "hidden",
  },
  productImg: { width: "100%", aspectRatio: 1 },
  outOfStock: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  outOfStockText: { color: "#cc1111", fontSize: 9, letterSpacing: 1 },
  productInfo: { padding: 10, gap: 6 },
  productName: { fontSize: 12, fontWeight: "600" },
  productPrice: { fontSize: 13, fontWeight: "700" },
  addBtn: { paddingVertical: 8, alignItems: "center", borderWidth: 1 },
  addBtnText: { fontSize: 10, letterSpacing: 2, fontWeight: "600" },
});
