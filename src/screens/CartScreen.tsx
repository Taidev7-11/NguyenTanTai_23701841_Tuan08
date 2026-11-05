import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { useAuth, useCart } from "../store/hooks";
import { confirmDialog } from "../utils/dialog"; // đã viết sẵn — dùng ở BT8.7a
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice, radius } from "../theme";

export function CartScreen({ navigation }: TabScreenProps<"Cart">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  const discount = useMemo(() => {
    if (applied === "SALE10") return Math.round(totalPrice * 0.1);
    if (applied === "GIAM50K") return Math.min(50000, totalPrice);
    return 0;
  }, [applied, totalPrice]);

  const finalTotal = Math.max(0, totalPrice - discount);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "SALE10" || code === "GIAM50K") {
      setApplied(code);
      setCouponErr(null);
    } else {
      setCouponErr("Mã không hợp lệ (thử SALE10 hoặc GIAM50K)");
    }
  };

  const askRemove = (bookId: number) => {
    confirmDialog("Xóa sách?", "Bạn có chắc muốn bỏ cuốn sách này khỏi giỏ hàng?", () => remove(bookId));
  };

  const goCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout", { total: finalTotal });
    } else {
      navigation.navigate("Login", { redirectTo: "Checkout", total: finalTotal });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.bookId)}
        renderItem={({ item }) => <CartItemRow item={item} onChangeQty={setQty} onRemove={askRemove} />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            emoji="🛒"
            title="Giỏ hàng trống"
            message="Hãy chọn vài cuốn sách yêu thích nhé."
            actionLabel="Khám phá sách"
            onAction={() => navigation.navigate("Home")}
          />
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Mã giảm giá (SALE10, GIAM50K)"
              placeholderTextColor={colors.muted}
              value={coupon}
              onChangeText={setCoupon}
              autoCapitalize="characters"
            />
            <Pressable style={styles.couponBtn} onPress={applyCoupon}>
              <Text style={styles.couponBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
          {couponErr ? <Text style={styles.couponError}>{couponErr}</Text> : null}

          <View style={styles.line}>
            <Text style={styles.muted}>Tạm tính</Text>
            <Text style={styles.value}>{formatPrice(totalPrice)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.line}>
              <Text style={styles.discountLabel}>Giảm giá ({applied})</Text>
              <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
            </View>
          )}
          <View style={styles.line}>
            <Text style={styles.total}>Tổng cộng</Text>
            <Text style={styles.total}>{formatPrice(finalTotal)}</Text>
          </View>
          <PrimaryButton title="Thanh toán" onPress={goCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: "#fff", padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  muted: { color: colors.muted },
  value: { fontWeight: "700", color: colors.text },
  discountLabel: { color: colors.success, fontWeight: "600" },
  discountValue: { color: colors.success, fontWeight: "700" },
  total: { fontSize: 17, fontWeight: "800", color: colors.navy },
  couponRow: { flexDirection: "row", gap: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
  },
  couponBtn: {
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  couponBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  couponError: { color: colors.danger, fontSize: 12 },
});
