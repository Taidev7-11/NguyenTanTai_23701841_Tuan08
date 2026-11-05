import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number; // 0–5 (có thể lẻ, làm tròn khi vẽ)
  size?: number;
  onChange?: (v: number) => void; // có truyền → cho phép bấm chọn sao
}

// BT8.5a: component sao TÁI SỬ DỤNG
// - vẽ 5 ngôi sao ★: sao <= Math.round(value) màu colors.warning, còn lại colors.line; cỡ chữ = size
// - nếu có onChange: bọc mỗi sao trong Pressable, bấm sao n → onChange(n)
export function RatingStars({ value, size = 18, onChange }: Props) {
  const rounded = Math.round(value);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => {
        const star = (
          <Text
            key={i}
            style={{
              fontSize: size,
              color: i <= rounded ? colors.warning : colors.line,
            }}
          >
            ★
          </Text>
        );
        if (!onChange) return star;
        return (
          <Pressable key={i} onPress={() => onChange(i)} hitSlop={6} accessibilityLabel={`${i} sao`}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
});
