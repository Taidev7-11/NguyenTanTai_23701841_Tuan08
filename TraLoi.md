# BÁO CÁO TRẢ LỜI CÂU HỎI THỰC HÀNH BUỔI 8
**Môn học:** Lập trình Thiết bị Di động (React Native)  
**Họ và tên sinh viên:** Nguyễn Tấn Tài  
**Mã số sinh viên:** 23701841  

---

### Câu 1: Cờ `ready` trong `usePersistence.ts`
**Câu hỏi:** Trong `useAutoPersist`, nếu bỏ điều kiện `ready` thì chuyện gì xảy ra với giỏ hàng đã lưu khi bạn mở lại app? Giải thích theo thứ tự các lần render.

**Trả lời:**
- Khi ứng dụng mới khởi động ở lần render đầu tiên, Redux store khởi tạo giỏ hàng với giá trị mặc định là một mảng rỗng `cart.items = []`.
- Thao tác đọc dữ liệu đã lưu từ bộ nhớ máy (`loadJSON<CartItem[]>(CART_KEY)`) là một tác vụ bất đồng bộ (asynchronous), cần một khoảng thời gian nhất định mới hoàn thành và trả về dữ liệu cũ.
- Nếu bỏ điều kiện `ready` (tức hook tự động ghi chạy ngay khi `ready = false`):
  1. **Lần render đầu tiên:** Hook `useAutoPersist` thấy `cartItems = []` sẽ lập tức gọi `saveJSON(CART_KEY, [])`. Lúc này, mảng rỗng trong store đã ghi đè và xóa sạch toàn bộ dữ liệu giỏ hàng đã lưu trước đó trong `AsyncStorage`.
  2. **Khi hàm đọc bất đồng bộ trả về:** Dữ liệu cũ đã bị mất hoặc hàm đọc trả về xong thì store đã bị ghi đè, khiến giỏ hàng luôn luôn bị rỗng mỗi khi mở lại app.
- Do đó, cờ `ready` đóng vai trò là chốt bảo vệ an toàn: chỉ khi nào đọc xong tất cả dữ liệu cũ từ bộ nhớ và dispatch vào store (`setReady(true)`), các hook `useAutoPersist` mới được phép ghi tự động khi state thay đổi.

---

### Câu 2: Token giả và An toàn thông tin
**Câu hỏi:** Ở bài này app tự so mật khẩu và tự tạo token. Hãy nêu hai điểm không an toàn. Hệ thống thật thì ai kiểm tra mật khẩu, và token nên lưu ở đâu thay cho `AsyncStorage`?

**Trả lời:**
- **Hai điểm không an toàn trong bài thực hành:**
  1. Mật khẩu lưu dưới dạng văn bản thô (plain-text) trong `db.json` và việc so khớp thông tin đăng nhập diễn ra trực tiếp ở phía client (ứng dụng di động). Kẻ tấn công có thể dễ dàng dịch ngược app hoặc bắt gói tin mạng để đọc được toàn bộ tài khoản và mật khẩu của người dùng.
  2. Token được sinh tự tạo ở client (ví dụ `fake-token-...`) mà không có khóa bí mật (secret key) hay chữ ký số (digital signature) từ server, dẫn tới việc bất kỳ ai cũng có thể giả mạo token hợp lệ để chiếm đoạt phiên đăng nhập.
- **Trong hệ thống thực tế:**
  1. **Phía kiểm tra mật khẩu:** Máy chủ backend là nơi duy nhất chịu trách nhiệm kiểm tra thông tin đăng nhập. Mật khẩu lưu trong cơ sở dữ liệu phải được băm an toàn một chiều (one-way hash) bằng các thuật toán hiện đại (như bcrypt, Argon2, PBKDF2) kèm theo muối (salt). Sau khi kiểm tra hợp lệ, server sẽ ký và cấp một token tiêu chuẩn (như JWT - JSON Web Token) có thời hạn sử dụng.
  2. **Nơi lưu trữ token an toàn:** Thay vì lưu trong `AsyncStorage` (vốn là bộ lưu trữ văn bản thuần/SQLite không được mã hóa, dễ bị trích xuất trên các thiết bị đã root hoặc jailbreak), token phải được lưu vào các phân vùng bảo mật phần cứng của hệ điều hành như **`SecureStore`** (sử dụng **Keychain** trên iOS và **Keystore/EncryptedSharedPreferences** trên Android).

---

### Câu 3: Hai `useEffect` trong `CartItemRow.tsx`
**Câu hỏi:** Thử xóa effect đồng bộ `setQty(item.quantity)`. Với thao tác nào thì số hiển thị trên nút bị lệch so với store? Nêu ít nhất 2 lợi ích của việc dùng `useState` cục bộ cho `qty` kết hợp `useDebounce`.

**Trả lời:**
- **Thao tác khiến số hiển thị bị lệch khi xóa `useEffect(() => { setQty(item.quantity); }, [item.quantity])`:**
  1. Khi nạp lại dữ liệu giỏ hàng từ `AsyncStorage` (quá trình hydrate lúc khởi động ứng dụng): state `qty` cục bộ đã khởi tạo bằng giá trị mặc định ban đầu trước khi store nhận dữ liệu nạp, nên không được cập nhật lại theo dữ liệu thực tế trong store.
  2. Khi người dùng từ màn hình khác (ví dụ trang chi tiết `BookDetailScreen`) bấm nút "Thêm vào giỏ" cho cùng cuốn sách đó: số lượng trong Redux store tăng lên, nhưng khi người dùng vào giỏ hàng, ô số lượng của dòng đó vẫn giữ nguyên số cũ trong state `qty` cục bộ.
  3. Khi xóa sản phẩm rồi thêm lại chính sản phẩm đó vào giỏ, nếu instance của dòng sản phẩm được tái sử dụng (recycling trong FlatList), `qty` sẽ hiển thị sai lệch so với store.
- **Lợi ích của việc dùng `useState` cục bộ kết hợp `useDebounce`:**
  1. **Giao diện phản hồi tức thì (Instant UI Feedback):** Khi người dùng bấm liên tục vào nút `+` hoặc `−`, số lượng trên nút tăng/giảm ngay lập tức mà không có độ trễ, không bị giật lag giao diện.
  2. **Giảm tải hiệu năng và số lần ghi dữ liệu (Performance Optimization):** Tránh việc dispatch liên tục các action lên Redux store và tránh kích hoạt liên tục hàm ghi xuống đĩa `AsyncStorage` mỗi mili-giây khi người dùng bấm nhanh, chỉ lưu một lần duy nhất sau khi người dùng dừng thao tác 300ms.

---

### Câu 4: Một nguồn dữ liệu duy nhất (Single Source of Truth)
**Câu hỏi:** Khi người dùng bấm nút tim ở `BookCard` trong `WishlistScreen`, luồng dữ liệu (data flow) diễn ra như thế nào từ lúc bấm đến khi cuốn sách biến mất khỏi màn hình? Nếu dùng `useState` riêng ở mỗi nơi thì tim ở lưới và chi tiết sẽ khác nhau ra sao?

**Trả lời:**
- **Luồng dữ liệu (Data Flow) khi bấm nút tim trong `WishlistScreen`:**
  1. Người dùng chạm vào `HeartButton` trên thẻ sách `BookCard`.
  2. Hàm `onPress` kích hoạt gọi `toggle(bookId)` từ custom hook `useWishlist()`.
  3. Action `toggleWishlist(bookId)` được dispatch đến Redux store (`wishlistSlice`).
  4. Reducer kiểm tra `ids`: vì `bookId` đã tồn tại trong mảng, reducer loại bỏ `bookId` ra khỏi mảng `ids` và cập nhật state mới của `wishlist`.
  5. Component `WishlistScreen` đang lắng nghe `ids` từ store qua selector `useWishlist()`. Khi `ids` thay đổi, hook `useMemo` tính toán lại `favorites = books.filter(b => ids.includes(b.id))`.
  6. Cuốn sách đó không còn nằm trong danh sách `favorites` nữa, `BookGrid` tự động re-render và cuốn sách biến mất ngay lập tức khỏi màn hình danh sách yêu thích.
- **Sự khác biệt nếu dùng `useState` riêng ở mỗi nơi:**
  - Nếu mỗi nút tim dùng `useState` cục bộ, các component sẽ bị phân mảnh trạng thái và mất tính nhất quán: người dùng bấm yêu thích ở thẻ sách trên màn hình Home (đổi thành tim đỏ), nhưng khi bấm vào xem chi tiết ở màn hình `BookDetailScreen` thì tim vẫn là màu xám (chưa thích). Đồng thời, danh sách yêu thích ở tab Tài khoản cũng không thể nhận biết để hiển thị sách đó. Redux store giải quyết triệt để vấn đề này bằng mô hình **Single Source of Truth** (nguồn chân lý duy nhất).

---

### Câu 5: Tính năng "Hiện / Ẩn mật khẩu" (Show/Hide Password Toggle)
**Câu hỏi:** Giải thích cách hiện thực bằng 1 state boolean `showPassword`. Bổ sung tính năng này vào `LoginScreen` (hoặc `FormField`) và đưa đoạn code minh họa.

**Trả lời:**
- **Giải thích cách hiện thực:**
  - Khai báo một state boolean quản lý trạng thái hiển thị: `const [showPassword, setShowPassword] = useState(false);`.
  - Liên kết với thuộc tính `secureTextEntry` của ô nhập mật khẩu: truyền `secureTextEntry={!showPassword}`.
    - Khi `showPassword === false` (mặc định), `secureTextEntry = true`, ký tự mật khẩu được ẩn dưới dạng dấu chấm tròn.
    - Khi người dùng bấm vào biểu tượng con mắt (👁 / 🙈), hàm đảo ngược state được gọi: `setShowPassword(prev => !prev)`.
    - Khi `showPassword === true`, `secureTextEntry = false`, các ký tự mật khẩu sẽ được hiển thị dạng văn bản rõ để người dùng kiểm tra.
- **Đoạn code minh họa:**

*1. Bổ sung `rightAccessory` trong `src/components/FormField.tsx`:*
```tsx
interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  rightAccessory?: React.ReactNode; // Cho phép truyền icon/nút bấm vào bên phải ô nhập
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
```

*2. Tích hợp trong `src/screens/LoginScreen.tsx`:*
```tsx
export function LoginScreen({ navigation, route }: RootScreenProps<"Login">) {
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false); // State quản lý ẩn/hiện mật khẩu

  return (
    // ...
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
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={8}
          accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <Text style={{ fontSize: 18 }}>{showPassword ? "👁️" : "🙈"}</Text>
        </Pressable>
      }
    />
    // ...
  );
}
```
*(Tính năng này cũng được áp dụng tương tự cho cả 2 ô "Mật khẩu" và "Nhập lại mật khẩu" trong màn hình `RegisterScreen.tsx`).*

