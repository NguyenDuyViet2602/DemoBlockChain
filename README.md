# 🔒 Demo Bảo Mật Web LearnHub

**Đề tài:** Sử dụng Burp Suite/ZAP để pentest ứng dụng web thật (mini project) – demo khai thác XSS, SQLi

---

## 👥 Danh sách thành viên nhóm

| STT | Họ và Tên | MSSV | Vai trò |
|-----|-----------|------|---------|
| 1 | Nguyễn Viết Duy Anh | 22810310401 | Backend Developer, Pentest |
| 2 | Bùi Minh Phương | 22810310403 | Frontend Developer, Pentest |
| 3 | Nguyễn Duy Việt | 22810310402 | Full-stack Developer, Pentest Lead |

---

## 📋 Phân chia công việc

### **Nguyễn Duy Việt (22810310402)**
- ✅ Thiết kế kiến trúc pentest mode (toggle vulnerable/secure)
- ✅ Implement middleware `pentestMode.js` (backend)
- ✅ Implement toggle mode với hotkey `Ctrl + /` (frontend)
- ✅ Implement SQL Injection vulnerabilities (auth.service.js, course.service.js)
- ✅ Implement XSS vulnerabilities (SearchPage.jsx, LearnCourse.jsx)
- ✅ Tạo trang demo `/pentest` với các endpoint vulnerable
- ✅ Tích hợp Burp Suite và Ngrok
- ✅ Viết tài liệu và hướng dẫn

### **Nguyễn Viết Duy Anh (22810310401)**
- ✅ Implement pentest service layer (`pentest.service.js`)
- ✅ Implement pentest controllers (`pentest.controller.js`)
- ✅ Implement pentest routes (`pentest.route.js`)
- ✅ Test SQL Injection vulnerabilities
- ✅ Test XSS vulnerabilities
- ✅ Chụp ảnh demo và tài liệu hóa kết quả

### **Bùi Minh Phương (22810310403)**
- ✅ Implement UI trang demo `/pentest` (PentestDemo.jsx)
- ✅ Implement axios interceptor với header `X-Pentest-Mode`
- ✅ Implement pentest mode utilities (`pentestMode.js`, `api.js`)
- ✅ Test các payload XSS và SQLi trên frontend
- ✅ Chụp ảnh demo và tài liệu hóa kết quả

---

## 🎯 Tổng quan dự án

LearnHub là một hệ thống học tập trực tuyến được xây dựng với:
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + Sequelize ORM
- **Database:** PostgreSQL

**Điểm đặc biệt:** Project có cơ chế toggle giữa chế độ **vulnerable** và **secure** bằng phím tắt `Ctrl + /`, cho phép demo các lỗ hổng bảo mật một cách trực quan.

---

## 🚀 Hướng dẫn cài đặt và chạy

### **Yêu cầu hệ thống:**
- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm hoặc yarn

### **Bước 1: Clone repository**
```bash
git clone https://github.com/NguyenDuyViet2602/DemoBaoMatWebLearnHub.git
cd DemoBaoMatWebLearnHub
```

### **Bước 2: Cài đặt dependencies**

**Backend:**
```bash
cd learnhub-backend
npm install
```

**Frontend:**
```bash
cd learnhub-frontend
npm install
```

### **Bước 3: Cấu hình Database**

1. Tạo database PostgreSQL:
```sql
CREATE DATABASE learnhub;
```

2. Cấu hình file `.env` trong `learnhub-backend/`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learnhub
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

3. Chạy migrations (nếu có):
```bash
cd learnhub-backend
npm run migrate
```

### **Bước 4: Khởi động ứng dụng**

**Terminal 1 - Backend:**
```bash
cd learnhub-backend
npm run dev
```
Backend sẽ chạy tại: `http://localhost:8080`

**Terminal 2 - Frontend:**
```bash
cd learnhub-frontend
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔧 Cấu hình Burp Suite và Ngrok (Để pentest)

### **Bước 1: Cài đặt Ngrok**
1. Download Ngrok: https://ngrok.com/download
2. Chạy Ngrok để expose frontend:
```bash
ngrok http 5173
```
3. Copy URL ngrok (ví dụ: `https://9dfdf633bdda.ngrok-free.app`)

### **Bước 2: Cấu hình Burp Suite**
1. Mở Burp Suite Community Edition
2. Vào **Proxy** → **Options**
3. Đảm bảo Proxy Listener: `127.0.0.1:8081`
4. Vào **Proxy** → **Intercept** → Bật "Intercept is on"

### **Bước 3: Cấu hình Browser Proxy**
1. Mở Firefox Settings
2. Network Settings → Manual proxy configuration
3. HTTP Proxy: `127.0.0.1`, Port: `8081`
4. Check "Use this proxy server for all protocols"
5. Cài đặt CA Certificate từ Burp (nếu cần)

---

## 🎮 Hướng dẫn sử dụng

### **1. Toggle Pentest Mode**

Nhấn `Ctrl + /` (hoặc `Cmd + /` trên Mac) để chuyển đổi giữa:
- **🔴 Vuln mode:** Các lỗ hổng được kích hoạt
- **🟢 Secure mode:** Code an toàn (production-ready)

Badge hiển thị ở góc dưới bên phải màn hình.

### **2. Demo XSS Reflected**

**Trên trang Search:**
1. Toggle sang **vuln mode** (`Ctrl + /`)
2. Truy cập: `http://localhost:5173/search`
3. Nhập payload: `<img src=x onerror=alert('XSS Reflected')>`
4. Nhấn "Tìm kiếm"
5. **Kết quả:** Alert popup xuất hiện

**Trên trang Demo `/pentest`:**
1. Truy cập: `http://localhost:5173/pentest`
2. Click tab **XSS Reflected**
3. Nhập payload và click "Test XSS Reflected"

**Hình ảnh demo:**

![XSS Reflected 1](hình%20ảnh%20bảo%20mật/XSS%20Reflected/XSS%20Reflected%201.png)
*Hình 1: XSS Reflected trên trang Search*

![XSS Reflected 2](hình%20ảnh%20bảo%20mật/XSS%20Reflected/XSS%20Reflected%202.png)
*Hình 2: Payload trong Burp Suite*

![XSS Reflected 3](hình%20ảnh%20bảo%20mật/XSS%20Reflected/XSS%20Reflected%203.png)
*Hình 3: Alert popup xuất hiện*

---

### **3. Demo XSS Stored**

**Trên trang Learn Course:**
1. Toggle sang **vuln mode**
2. Đăng nhập và vào một khóa học đã enroll
3. Scroll xuống phần Comments
4. Nhập comment: `<script>alert('XSS Stored')</script>`
5. Click "Gửi bình luận"
6. Reload trang → Alert popup xuất hiện

**Trên trang Demo `/pentest`:**
1. Truy cập: `http://localhost:5173/pentest`
2. Click tab **XSS Stored**
3. Nhập comment và click "Lưu Comment"
4. Click "Refresh List" → Alert popup xuất hiện

**Hình ảnh demo:**

![XSS Stored 1](hình%20ảnh%20bảo%20mật/XSS%20Stored/XSS%20Stored%201.png)
*Hình 4: Nhập XSS payload vào comment*

![XSS Stored 2](hình%20ảnh%20bảo%20mật/XSS%20Stored/XSS%20Stored%202.png)
*Hình 5: Comment được lưu với payload*

![XSS Stored 3](hình%20ảnh%20bảo%20mật/XSS%20Stored/XSS%20Stored%203.png)
*Hình 6: Alert popup khi reload trang*

---

### **4. Demo SQL Injection - Search**

1. Toggle sang **vuln mode**
2. Truy cập: `http://localhost:5173/search`
3. Nhập payload: `%' OR 1=1 --`
4. Nhấn "Tìm kiếm"
5. **Kết quả:** Trả về tất cả khóa học

**Trên trang Demo `/pentest`:**
1. Truy cập: `http://localhost:5173/pentest`
2. Click tab **SQLi Search**
3. Nhập payload: `%' OR 1=1 --`
4. Click "Test SQL Injection"

**Hình ảnh demo:**

![SQL Injection Search 1](hình%20ảnh%20bảo%20mật/SQL%20Injection%20-%20Search/SQL%20Injection%20-%20Search%201.png)
*Hình 7: SQLi Search payload*

![SQL Injection Search 2](hình%20ảnh%20bảo%20mật/SQL%20Injection%20-%20Search/SQL%20Injection%20-%20Search%202.png)
*Hình 8: Kết quả trả về tất cả courses trong Burp Suite*

---

### **5. Demo SQL Injection - Login Bypass**

1. Toggle sang **vuln mode**
2. Click nút "Login"
3. Trong ô Email, nhập: `' OR 1=1 --`
4. Trong ô Password, nhập: `anything`
5. Click "Đăng nhập"
6. **Kết quả:** Đăng nhập thành công (bypass authentication)

**Trên trang Demo `/pentest`:**
1. Truy cập: `http://localhost:5173/pentest`
2. Click tab **SQLi Login**
3. Nhập payload và click "Test Login Bypass"

**Hình ảnh demo:**

![SQL Injection Login Bypass 1](hình%20ảnh%20bảo%20mật/SQL%20Injection%20-%20Login%20Bypass/SQL%20Injection%20-%20Login%20Bypass%201.png)
*Hình 9: SQLi Login payload trong form*

![SQL Injection Login Bypass 2](hình%20ảnh%20bảo%20mật/SQL%20Injection%20-%20Login%20Bypass/SQL%20Injection%20-%20Login%20Bypass%202.png)
*Hình 10: Đăng nhập thành công trong Burp Suite*

---

### **6. Demo SQL Injection - UNION SELECT**

1. Truy cập: `http://localhost:5173/pentest`
2. Click tab **SQLi UNION**
3. Nhập payload: `0 UNION SELECT 1, fullname, passwordhash FROM users--`
4. Click "Test UNION SELECT"
5. **Kết quả:** Trả về password hashes từ database

**Hình ảnh demo:**

![SQL Injection UNION SELECT 1](hình%20ảnh%20bảo%20mật/SQL%20Injection%20-%20UNION%20SELECT/SQL%20Injection%20-%20UNION%20SELECT%201.png)
*Hình 11: SQLi UNION SELECT payload*

![SQL Injection UNION SELECT 2](hình%20ảnh%20bảo%20mật/SQL%20Injection%20-%20UNION%20SELECT/SQL%20Injection%20-%20UNION%20SELECT%202.png)
*Hình 12: Password hashes được extract trong Burp Suite*

---

## 📊 Các lỗ hổng được demo

### **1. XSS (Cross-Site Scripting)**

#### **XSS Reflected:**
- **Vị trí:** Trang Search (`/search`)
- **Payload:** `<img src=x onerror=alert('XSS')>`
- **Nguyên nhân:** Input được render với `dangerouslySetInnerHTML` trong vuln mode
- **Tác động:** Attacker có thể execute JavaScript tùy ý

#### **XSS Stored:**
- **Vị trí:** Comments trong bài học (`/learn/:courseId`)
- **Payload:** `<script>alert('XSS Stored')</script>`
- **Nguyên nhân:** Comment được lưu không sanitize và render raw HTML
- **Tác động:** Script tự động execute mỗi khi user xem comment

### **2. SQL Injection (SQLi)**

#### **SQLi Search:**
- **Vị trí:** Search courses (`/api/v1/courses?search=...`)
- **Payload:** `%' OR 1=1 --`
- **Nguyên nhân:** Raw SQL query với string concatenation
- **Tác động:** Lấy được tất cả records từ database

#### **SQLi Login Bypass:**
- **Vị trí:** Login endpoint (`/api/v1/auth/login`)
- **Payload:** `' OR 1=1 --`
- **Nguyên nhân:** Raw SQL query trong authentication
- **Tác động:** Bypass authentication, đăng nhập không cần password

#### **SQLi UNION SELECT:**
- **Vị trí:** User endpoint (`/api/v1/pentest/sqli/user?id=...`)
- **Payload:** `0 UNION SELECT 1, fullname, passwordhash FROM users--`
- **Nguyên nhân:** Raw SQL query cho phép UNION
- **Tác động:** Extract password hashes và dữ liệu nhạy cảm

---

## 🛡️ Phòng thủ

### **Secure Mode (Production-ready):**

1. **XSS Prevention:**
   - React tự động escape HTML
   - Không dùng `dangerouslySetInnerHTML`
   - Input validation và sanitization

2. **SQL Injection Prevention:**
   - Sequelize ORM với parameterized queries
   - Input validation
   - Prepared statements

3. **Authentication:**
   - Bcrypt password hashing
   - JWT tokens
   - Rate limiting

---

## 📁 Cấu trúc Project

```
DemoBaoMatWebLearnHub/
├── learnhub-backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── pentestMode.js          # Middleware đọc X-Pentest-Mode header
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Login controller (SQLi vuln)
│   │   │   ├── comment.controller.js    # Comment controller (XSS vuln)
│   │   │   ├── course.controller.js     # Course controller (SQLi vuln)
│   │   │   └── pentest.controller.js    # Pentest demo controllers
│   │   ├── services/
│   │   │   ├── auth.service.js          # Login service (SQLi)
│   │   │   ├── comment.service.js      # Comment service (XSS)
│   │   │   ├── course.service.js       # Course service (SQLi)
│   │   │   └── pentest.service.js      # Pentest demo services
│   │   └── api/v1/
│   │       └── pentest.route.js        # Pentest routes
│   └── app.js                          # Main app file
│
└── learnhub-frontend/
    └── src/
        ├── App.jsx                      # Hotkey toggle mode
        ├── utils/
        │   ├── api.js                   # Axios với X-Pentest-Mode header
        │   └── pentestMode.js          # Toggle mode utilities
        ├── pages/
        │   ├── SearchPage.jsx           # XSS Reflected
        │   ├── LearnCourse.jsx          # XSS Stored
        │   └── PentestDemo.jsx         # Demo page
        └── components/
            └── LoginPopup.jsx          # Login form (SQLi)
```

---

## 🔗 Links hữu ích

- **Repository:** https://github.com/NguyenDuyViet2602/DemoBaoMatWebLearnHub
- **Burp Suite:** https://portswigger.net/burp/communitydownload
- **Ngrok:** https://ngrok.com/download
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/

---

## ⚠️ Cảnh báo

**⚠️ QUAN TRỌNG:**
- Code vulnerable chỉ dùng cho mục đích **học tập và demo**
- **KHÔNG SỬ DỤNG** trong production
- Tất cả lỗ hổng đều được implement cố ý để phục vụ pentest
- Code production đã được viết an toàn với ORM và proper sanitization

---

## 📝 License

Dự án này được tạo ra cho mục đích học tập. Vui lòng không sử dụng code vulnerable trong môi trường production.

---

## 👨‍💻 Contributors

- **Nguyễn Duy Việt** - [@NguyenDuyViet2602](https://github.com/NguyenDuyViet2602)
- **Nguyễn Viết Duy Anh** - [@DuyAnh2074](https://github.com/DuyAnh2074)
- **Bùi Minh Phương** - [@minhp19](https://github.com/minhp19)

---

**Chúc bạn học tập hiệu quả! 🔒**

