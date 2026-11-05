import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { register } from "../services/authService"; // đã viết sẵn: register(name, email, password)
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import { validateEmail, validatePassword, validateRequired } from "../utils/validators";
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function RegisterScreen({ navigation, route }: RootScreenProps<"Register">) {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const errName = validateRequired("Họ tên")(name);
    const errEmail = validateEmail(email);
    const errPass = validatePassword(password);
    const errConfirm = !confirm.trim()
      ? "Vui lòng nhập lại mật khẩu"
      : confirm !== password
      ? "Mật khẩu nhập lại không khớp"
      : null;

    setErrors({ name: errName, email: errEmail, password: errPass, confirm: errConfirm });
    if (errName || errEmail || errPass || errConfirm) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const res = await register(name.trim(), email.trim(), password);
      signIn(res.user, res.token);
      if (route.params?.redirectTo === "Checkout") {
        navigation.replace("Checkout", { total: route.params.total ?? 0 });
      } else {
        navigation.navigate("Tabs", { screen: "Home" });
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản mới</Text>

        <FormField
          label="Họ tên"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setErrors((e) => ({ ...e, name: null }));
          }}
          error={errors.name}
          placeholder="Nguyễn Văn A"
        />

        <FormField
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setErrors((e) => ({ ...e, email: null }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="ban@example.com"
        />

        <FormField
          label="Mật khẩu"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrors((e) => ({ ...e, password: null }));
          }}
          error={errors.password}
          secureTextEntry={!showPassword}
          placeholder="Tối thiểu 6 ký tự"
          rightAccessory={
            <Pressable
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={8}
              accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? "👁️" : "🙈"}</Text>
            </Pressable>
          }
        />

        <FormField
          label="Nhập lại mật khẩu"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            setErrors((e) => ({ ...e, confirm: null }));
          }}
          error={errors.confirm}
          secureTextEntry={!showConfirm}
          placeholder="Nhập lại chính xác mật khẩu"
          rightAccessory={
            <Pressable
              onPress={() => setShowConfirm((p) => !p)}
              hitSlop={8}
              accessibilityLabel={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <Text style={{ fontSize: 18 }}>{showConfirm ? "👁️" : "🙈"}</Text>
            </Pressable>
          }
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <PrimaryButton title="Đăng ký" onPress={onSubmit} loading={loading} />

        <Pressable onPress={() => navigation.replace("Login", route.params)}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy, textAlign: "center", marginBottom: 6 },
  submitError: { color: colors.danger, textAlign: "center" },
  link: { color: colors.indigo, fontWeight: "700", textAlign: "center" },
});
