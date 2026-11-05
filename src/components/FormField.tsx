import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius } from "../theme";

interface Props extends TextInputProps {
  label: string;
  error?: string | null; // có lỗi → viền đỏ + dòng báo lỗi NGAY DƯỚI ô nhập
  rightAccessory?: React.ReactNode;
}

export function FormField({ label, error, style, rightAccessory, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {rightAccessory ? (
        <View style={[styles.inputRow, error ? styles.inputError : null]}>
          <TextInput
            style={[styles.inputInRow, style]}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            {...rest}
          />
          <View style={styles.accessory}>{rightAccessory}</View>
        </View>
      ) : (
        <TextInput
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          {...rest}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  label: { fontWeight: "700", color: colors.text },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.text },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12 },
  inputInRow: { flex: 1, paddingVertical: 10, color: colors.text },
  accessory: { marginLeft: 8 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});
