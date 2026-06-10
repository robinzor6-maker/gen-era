import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";
import { Pagination, Product, ProductListResponse } from "@/lib/types";

const CATEGORIES = ["", "clothing", "accessories"];
const CAT_LABELS: Record<string, string> = {
  "": "ALL",
  clothing: "CLOTHING",
  accessories: "ACCESSORIES",
};

function formatPrice(price: number) {
  return price.toLocaleString("ar-EG") + " ج.م";
}

export default function StoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const load = useCallback(async (opts: { cat?: string; q?: string; pg?: number } = {}) => {
    const cat = opts.cat ?? category;
    const q = opts.q ?? query;
    const pg = opts.pg ?? page;
    const params: Record<string, string> = { page: String(pg), limit: "12" };
    if (cat) params.category = cat;
    if (q) params.q = q;
    try {
      const res = await api.get<ProductListResponse>("/products", params);
      setProducts(res.data || []);
      setPagination(res.pagination || null);
    } catch (e) {
      console.error(e);
    }
  }, [category, query, page]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setQuery("");
    setPage(1);
    setLoading(true);
    api.get<ProductListResponse>("/products", {
      page: "1",
      limit: "12",
      ...(cat ? { category: cat } : {}),
    }).then((res) => {
      setProducts(res.data || []);
      setPagination(res.pagination || null);
    }).finally(() => setLoading(false));
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
    if (q.length > 1) {
      api.get<ProductListResponse>("/products", {
        page: "1",
        limit: "12",
        q,
        ...(category ? { category } : {}),
      }).then((res) => {
        setProducts(res.data || []);
        setPagination(res.pagination || null);
      });
    } else if (q.length === 0) {
      api.get<ProductListResponse>("/products", {
        page: "1",
        limit: "12",
        ...(category ? { category } : {}),
      }).then((res) => {
        setProducts(res.data || []);
        setPagination(res.pagination || null);
      });
    }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.obsidian, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${item.slug}`)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
      {item.stock === 0 && (
        <View style={styles.soldOut}>
          <Text style={styles.soldOutText}>SOLD OUT</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardCategory, { color: colors.mutedForeground }]}>
          {item.category.toUpperCase()}
        </Text>
        <Text style={[styles.cardName, { color: colors.sand2 }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.cardPrice, { color: colors.fire }]}>{formatPrice(item.price)}</Text>
      </View>
    </Pressable>
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
        <Text style={[styles.headerTitle, { color: colors.sand }]}>𓂀 ARCHIVE</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={14} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.sand }]}
            placeholder="Search artifacts..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category filter */}
      <View style={[styles.catRow, { borderBottomColor: colors.border }]}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.catBtn,
              {
                borderBottomColor: category === cat ? colors.sand : "transparent",
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => handleCategory(cat)}
          >
            <Text
              style={[
                styles.catText,
                { color: category === cat ? colors.sand : colors.mutedForeground },
              ]}
            >
              {CAT_LABELS[cat]}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.sand} size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i) => i._id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          scrollEnabled={!!products.length}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No artifacts found
              </Text>
            </View>
          }
          ListFooterComponent={
            pagination && pagination.pages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  disabled={page <= 1}
                  onPress={() => {
                    const newPage = page - 1;
                    setPage(newPage);
                    setLoading(true);
                    api.get<ProductListResponse>("/products", {
                      page: String(newPage),
                      limit: "12",
                      ...(category ? { category } : {}),
                      ...(query ? { q: query } : {}),
                    }).then((res) => {
                      setProducts(res.data || []);
                    }).finally(() => setLoading(false));
                  }}
                >
                  <Feather name="chevron-left" size={22} color={page <= 1 ? colors.mutedForeground : colors.sand} />
                </Pressable>
                <Text style={[styles.pageText, { color: colors.mutedForeground }]}>
                  {page} / {pagination.pages}
                </Text>
                <Pressable
                  disabled={page >= pagination.pages}
                  onPress={() => {
                    const newPage = page + 1;
                    setPage(newPage);
                    setLoading(true);
                    api.get<ProductListResponse>("/products", {
                      page: String(newPage),
                      limit: "12",
                      ...(category ? { category } : {}),
                      ...(query ? { q: query } : {}),
                    }).then((res) => {
                      setProducts(res.data || []);
                    }).finally(() => setLoading(false));
                  }}
                >
                  <Feather name="chevron-right" size={22} color={page >= pagination.pages ? colors.mutedForeground : colors.sand} />
                </Pressable>
              </View>
            ) : null
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
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  catRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 20,
    borderBottomWidth: 1,
    paddingBottom: 0,
  },
  catBtn: { paddingVertical: 10 },
  catText: { fontSize: 11, letterSpacing: 2, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 12, paddingBottom: Platform.OS === "web" ? 34 : 100 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, borderWidth: 1, overflow: "hidden" },
  cardImg: { width: "100%", aspectRatio: 0.85 },
  soldOut: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  soldOutText: { color: "#cc1111", fontSize: 9, letterSpacing: 1 },
  cardInfo: { padding: 10, gap: 4 },
  cardCategory: { fontSize: 9, letterSpacing: 2 },
  cardName: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  cardPrice: { fontSize: 13, fontWeight: "700" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 16,
  },
  pageText: { fontSize: 13 },
});
