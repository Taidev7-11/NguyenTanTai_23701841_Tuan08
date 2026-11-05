import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { colors, formatPrice, radius } from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

// BT8.6: nút −/+ với STATE CỤC BỘ + debounce 300ms
// 1) const [qty, setQty] = useState(item.quantity); const debouncedQty = useDebounce(qty, 300);
// 2) useEffect: khi debouncedQty khác item.quantity → onChangeQty(item.bookId, debouncedQty)
// 3) useEffect: khi item.quantity đổi từ nơi khác → setQty(item.quantity)
// 4) canDec = qty > 1; canInc = qty < item.stock (không vượt tồn kho); nút bị mờ khi không bấm được
// 5) hiển thị "Còn {item.stock}"
export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty, item.bookId, item.quantity, onChangeQty]);

  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <Text style={styles.stock}>Còn {item.stock}</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable
          style={[styles.stepBtn, !canDec && styles.stepBtnDisabled]}
          disabled={!canDec}
          onPress={() => setQty((q) => Math.max(1, q - 1))}
          accessibilityLabel="Giảm"
        >
          <Text style={[styles.stepText, !canDec && styles.stepTextDisabled]}>−</Text>
        </Pressable>
        <Text style={styles.qty}>{qty}</Text>
        <Pressable
          style={[styles.stepBtn, !canInc && styles.stepBtnDisabled]}
          disabled={!canInc}
          onPress={() => setQty((q) => Math.min(item.stock, q + 1))}
          accessibilityLabel="Tăng"
        >
          <Text style={[styles.stepText, !canInc && styles.stepTextDisabled]}>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 5,
    gap: 10,
  },
  cover: {
    width: 54,
    height: 72,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  stock: { color: colors.muted, fontSize: 12 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepText: { fontSize: 16, fontWeight: "700", color: colors.text },
  stepTextDisabled: { color: colors.muted },
  qty: { minWidth: 20, textAlign: "center", fontWeight: "700", color: colors.navy },
  trash: { fontSize: 22 },
});
