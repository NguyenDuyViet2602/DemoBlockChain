# TỔNG HỢP ĐỀ TÀI BLOCKCHAIN
## THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG LEARN-TO-EARN TRÊN NỀN TẢNG BLOCKCHAIN

---

## MỤC LỤC

1. [DANH SÁCH FILE CODE LIÊN QUAN](#1-danh-sách-file-code-liên-quan)
2. [TÁC DỤNG CỦA TỪNG FILE](#2-tác-dụng-của-từng-file)
3. [THÔNG TIN TỔNG QUAN VỀ ĐỀ TÀI](#3-thông-tin-tổng-quan-về-đề-tài)
4. [CÂU HỎI VÀ TRẢ LỜI MẪU CHO BÁO CÁO](#4-câu-hỏi-và-trả-lời-mẫu-cho-báo-cáo)
5. [PHÂN CÔNG CHO NHÓM 4 NGƯỜI](#5-phân-công-cho-nhóm-4-người)

---

## 1. DANH SÁCH FILE CODE LIÊN QUAN

### 1.1. Smart Contracts (Solidity)

```
learnhub-backend/contracts/
├── LearnHubToken.sol          # ERC-20 Token contract
├── RewardDistribution.sol     # Reward distribution contract
├── CertificateNFT.sol          # ERC-721 NFT certificate contract
└── CoursePayment.sol           # Course payment contract
```

### 1.2. Backend Services

```
learnhub-backend/src/services/
├── blockchain.service.js       # Service tương tác với blockchain
├── reward.service.js           # Service tính toán và phân phối rewards
├── lht-payment.service.js     # Service thanh toán bằng LHT
└── lht-discount.service.js    # Service giảm giá bằng LHT
```

### 1.3. Backend Controllers

```
learnhub-backend/src/controllers/
└── blockchain.controller.js   # API endpoints cho blockchain
```

### 1.4. Backend API Routes

```
learnhub-backend/src/api/v1/
├── blockchain.route.js         # Routes cho blockchain APIs
└── payment.route.js            # Routes cho payment (có LHT)
```

### 1.5. Backend Models

```
learnhub-backend/src/models/
├── walletaddresses.js          # Model lưu địa chỉ ví
├── tokentransactions.js       # Model lưu lịch sử giao dịch
├── rewardsearned.js           # Model lưu phần thưởng đã nhận
└── nftcertificates.js         # Model lưu NFT chứng chỉ
```

### 1.6. Backend Migrations

```
learnhub-backend/migrations/
├── add-video-progress-and-quiz-type.sql
├── add-essayanswer-to-quizanswers.sql
├── allow-null-selectedoptionid.sql
└── add-login-streak-fields.sql
```

### 1.7. Backend Scripts

```
learnhub-backend/scripts/
├── deploy.js                   # Deploy tất cả contracts
├── deploy-course-payment.js    # Deploy CoursePayment contract
├── redeploy-reward-distribution.js  # Redeploy RewardDistribution
├── update-env.js               # Update .env với contract addresses
└── run-migration.js            # Chạy database migrations
```

### 1.8. Frontend Components

```
learnhub-frontend/src/components/
└── WalletConnect.jsx           # Component kết nối MetaMask
```

### 1.9. Frontend Contexts

```
learnhub-frontend/src/contexts/
└── BlockchainContext.jsx       # Context quản lý blockchain state
```

### 1.10. Frontend Pages

```
learnhub-frontend/src/pages/
├── BlockchainRewards.jsx        # Trang hiển thị rewards và transactions
└── Forum.jsx                   # Trang forum (có reward)
```

### 1.11. Frontend Services & Utils

```
learnhub-frontend/src/services/
└── blockchain.service.js       # API calls cho blockchain

learnhub-frontend/src/utils/
├── api.js                      # API configuration
└── ethers-helper.js            # Ethers.js helper functions
```

### 1.12. Frontend Enhanced Pages

```
learnhub-frontend/src/pages/
├── Checkout.jsx                # Enhanced với LHT payment & discount
├── LearnCourse.jsx              # Enhanced với reward tracking
├── CourseDetail.jsx            # Enhanced với review rewards
└── Teacher.jsx                 # Enhanced với essay quiz grading
```

### 1.13. Configuration Files

```
learnhub-backend/
├── hardhat.config.js           # Hardhat configuration
├── deployment-mumbai.json       # Deployed contract addresses
└── package.json                # Dependencies (hardhat, ethers, etc.)
```

---

## 2. TÁC DỤNG CỦA TỪNG FILE

### 2.1. Smart Contracts

#### `LearnHubToken.sol`
**Tác dụng:**
- Định nghĩa token ERC-20 (LHT - LearnHub Token)
- Quản lý tổng cung tối đa (1 tỷ LHT)
- Cho phép mint token khi phân phối phần thưởng
- Cho phép burn token khi sử dụng để thanh toán
- Quản lý quyền truy cập (MINTER_ROLE, BURNER_ROLE)

**Các hàm chính:**
- `mint(address to, uint256 amount, string reason)` - Mint tokens
- `burnFrom(address from, uint256 amount, string reason)` - Burn tokens
- `grantMinterRole(address account)` - Cấp quyền mint
- `grantBurnerRole(address account)` - Cấp quyền burn

#### `RewardDistribution.sol`
**Tác dụng:**
- Phân phối phần thưởng tự động cho các hoạt động học tập
- Ngăn chặn việc claim phần thưởng nhiều lần (double-claiming prevention)
- Quản lý số lượng phần thưởng cho từng loại hoạt động
- Tương tác với LearnHubToken để mint tokens

**Các hàm chính:**
- `distributeLessonReward()` - Phân phối 10 LHT cho hoàn thành bài học
- `distributeQuizReward()` - Phân phối 10-50 LHT cho quiz (dựa trên điểm)
- `distributeCourseCompletionReward()` - Phân phối 200 LHT cho hoàn thành khóa học
- `distributeReviewReward()` - Phân phối 5 LHT cho review
- `distributeForumReward()` - Phân phối 3 LHT cho forum participation
- `distributeStreakReward()` - Phân phối 20-30+ LHT cho login streak

#### `CertificateNFT.sol`
**Tác dụng:**
- Tạo NFT chứng chỉ khi hoàn thành khóa học
- Lưu trữ metadata của chứng chỉ (URI)
- Mỗi chứng chỉ là duy nhất và không thể thay thế
- Ngăn chặn tạo chứng chỉ trùng lặp

**Các hàm chính:**
- `mintCertificate(address to, uint256 courseId, string metadataURI)` - Mint NFT chứng chỉ

#### `CoursePayment.sol`
**Tác dụng:**
- Xử lý thanh toán khóa học bằng LHT
- Quản lý tỷ giá trao đổi VND/LHT
- Chuyển token từ người mua đến treasury
- Ngăn chặn thanh toán trùng lặp

**Các hàm chính:**
- `payWithLHT()` - Xử lý thanh toán bằng LHT
- `calculateLHTAmount()` - Tính toán số LHT cần thiết
- `updateExchangeRate()` - Cập nhật tỷ giá
- `isOrderPaid()` - Kiểm tra đơn hàng đã thanh toán chưa

### 2.2. Backend Services

#### `blockchain.service.js`
**Tác dụng:**
- Khởi tạo kết nối với blockchain (Polygon Amoy)
- Tương tác với tất cả smart contracts
- Quản lý ví và giao dịch
- Phân phối phần thưởng thông qua smart contracts
- Xử lý token transfers và approvals

**Các hàm chính:**
- `initializeBlockchain()` - Khởi tạo provider, signer, contracts
- `connectWallet(userId, address)` - Kết nối ví với user account
- `getTokenBalance(userId)` - Lấy số dư LHT của user
- `distributeLessonReward()` - Phân phối phần thưởng bài học
- `distributeQuizReward()` - Phân phối phần thưởng quiz
- `distributeCourseReward()` - Phân phối phần thưởng khóa học
- `transferTokensForDiscount()` - Transfer LHT cho discount
- `payCourseWithLHT()` - Thanh toán khóa học bằng LHT
- `checkTokenApproval()` - Kiểm tra token approval
- `getBackendWalletAddress()` - Lấy địa chỉ backend wallet

#### `reward.service.js`
**Tác dụng:**
- Tính toán số lượng phần thưởng cho từng loại hoạt động
- Phân phối phần thưởng thông qua blockchain service
- Lưu trữ lịch sử phần thưởng vào database
- Xử lý các edge cases (already claimed, wallet not connected)

**Các hàm chính:**
- `calculateReward(activityType, ...)` - Tính toán phần thưởng
- `distributeLessonReward()` - Phân phối phần thưởng bài học
- `distributeQuizReward()` - Phân phối phần thưởng quiz
- `distributeCourseReward()` - Phân phối phần thưởng khóa học
- `distributeReviewReward()` - Phân phối phần thưởng review
- `distributeForumReward()` - Phân phối phần thưởng forum
- `distributeStreakReward()` - Phân phối phần thưởng streak

#### `lht-payment.service.js`
**Tác dụng:**
- Tính toán số LHT cần thiết để thanh toán khóa học
- Kiểm tra số dư LHT của user
- Kiểm tra token approval
- Xử lý thanh toán bằng LHT trên blockchain

**Các hàm chính:**
- `calculateLHTAmount(vndAmount)` - Tính toán LHT cần thiết
- `processLHTPayment(userId, orderId)` - Xử lý thanh toán LHT
- `getPaymentInfo(userId, orderId)` - Lấy thông tin thanh toán

#### `lht-discount.service.js`
**Tác dụng:**
- Tính toán giảm giá từ LHT (1 LHT = 1,000 VND)
- Tính toán số LHT tối đa có thể dùng (tối đa 30% giá trị đơn hàng)
- Áp dụng giảm giá cho đơn hàng
- Transfer/burn LHT sau khi thanh toán thành công

**Các hàm chính:**
- `calculateVNDDiscount(lhtAmount)` - Tính VND discount từ LHT
- `getMaxLHTUsable(userId, orderAmount)` - Lấy max LHT có thể dùng
- `applyLHTDiscount(userId, orderId, lhtAmount)` - Áp dụng LHT discount

### 2.3. Backend Controllers & Routes

#### `blockchain.controller.js`
**Tác dụng:**
- Xử lý các API requests liên quan đến blockchain
- Trả về dữ liệu về wallet, balance, rewards, transactions
- Xử lý các requests phân phối phần thưởng

**Các endpoints:**
- `GET /api/v1/blockchain/wallet` - Lấy địa chỉ ví
- `GET /api/v1/blockchain/balance` - Lấy số dư LHT
- `GET /api/v1/blockchain/rewards/stats` - Thống kê phần thưởng
- `GET /api/v1/blockchain/rewards/history` - Lịch sử phần thưởng
- `GET /api/v1/blockchain/transactions` - Lịch sử giao dịch
- `POST /api/v1/blockchain/rewards/streak` - Claim streak reward
- `GET /api/v1/blockchain/backend-wallet` - Lấy backend wallet address

#### `payment.controller.js` (Enhanced)
**Tác dụng:**
- Xử lý thanh toán VNPay và LHT
- Xử lý LHT discount cho VNPay payments
- Tính toán LHT cần thiết

**Các endpoints mới:**
- `GET /api/v1/payment/lht/info/:orderId` - Thông tin thanh toán LHT
- `POST /api/v1/payment/lht/pay` - Thanh toán bằng LHT
- `GET /api/v1/payment/lht/calculate` - Tính toán LHT
- `GET /api/v1/payment/lht/discount/max` - Max LHT discount

### 2.4. Frontend Components & Pages

#### `WalletConnect.jsx`
**Tác dụng:**
- Component để kết nối ví MetaMask với tài khoản
- Hiển thị trạng thái kết nối
- Xử lý network switching

#### `BlockchainContext.jsx`
**Tác dụng:**
- Quản lý global state cho blockchain
- Lưu trữ wallet address, token balance, connection status
- Tự động load wallet từ database khi user login
- Provide blockchain state cho các components khác

#### `BlockchainRewards.jsx`
**Tác dụng:**
- Hiển thị số dư LHT hiện tại
- Hiển thị thống kê phần thưởng
- Hiển thị lịch sử giao dịch
- Hiển thị login streak và cho phép claim reward

#### `Checkout.jsx` (Enhanced)
**Tác dụng:**
- Cho phép chọn phương thức thanh toán (VNPay hoặc LHT)
- Cho phép sử dụng LHT để giảm giá (tối đa 30%)
- Hiển thị thông tin approval và cho phép approve tokens
- Xử lý thanh toán bằng LHT

#### `ethers-helper.js`
**Tác dụng:**
- Các hàm tiện ích để tương tác với MetaMask
- Kiểm tra và chuyển network (Polygon Amoy)
- Kiểm tra và approve tokens
- Xử lý scientific notation trong amounts

**Các hàm chính:**
- `checkNetwork()` - Kiểm tra và chuyển network
- `getProvider()` - Lấy provider từ MetaMask
- `getSigner()` - Lấy signer từ MetaMask
- `checkTokenApproval()` - Kiểm tra approval
- `approveTokens()` - Approve tokens
- `checkDiscountApproval()` - Kiểm tra approval cho discount
- `approveTokensForDiscount()` - Approve tokens cho discount

### 2.5. Database Models

#### `walletaddresses.js`
**Tác dụng:**
- Lưu trữ địa chỉ ví blockchain của người dùng
- Liên kết user account với wallet address
- Lưu thông tin network

#### `tokentransactions.js`
**Tác dụng:**
- Lưu trữ lịch sử giao dịch token
- Lưu transaction hash, amount, type (reward/spend)
- Lưu activity type và activity ID
- Lưu status (confirmed/pending/failed)

#### `rewardsearned.js`
**Tác dụng:**
- Lưu trữ các phần thưởng đã nhận
- Liên kết với tokentransactions
- Lưu activity type và activity ID

#### `nftcertificates.js`
**Tác dụng:**
- Lưu trữ thông tin NFT chứng chỉ
- Lưu token ID, token URI, transaction hash
- Liên kết với user và course

---

## 3. THÔNG TIN TỔNG QUAN VỀ ĐỀ TÀI

### 3.1. Mục tiêu đề tài

**Mục tiêu chính:**
Thiết kế và triển khai một hệ thống Learn-to-Earn hoàn chỉnh trên nền tảng blockchain Polygon, tích hợp với nền tảng học tập trực tuyến hiện có.

**Mục tiêu cụ thể:**
1. Phát triển smart contracts cho token ERC-20 (LearnHub Token - LHT) và hệ thống phân phối phần thưởng
2. Triển khai cơ chế thưởng tự động cho các hoạt động học tập
3. Tích hợp ví MetaMask và hệ thống thanh toán bằng token
4. Xây dựng giao diện người dùng để tương tác với blockchain
5. Đảm bảo tính minh bạch và bảo mật của hệ thống

### 3.2. Công nghệ sử dụng

**Blockchain:**
- Network: Polygon Amoy Testnet (Chain ID: 80002)
- Smart Contracts: Solidity 0.8.0+
- Development: Hardhat
- Libraries: OpenZeppelin Contracts v4

**Backend:**
- Node.js, Express.js
- Sequelize ORM
- PostgreSQL
- Ethers.js v6

**Frontend:**
- React.js
- Vite
- Ethers.js v6
- MetaMask Integration

### 3.3. Smart Contracts Deployed

| Contract | Address | Chức năng |
|----------|---------|-----------|
| LearnHubToken | `0xC40444E53a0Fc052181b59942cF5d2Af9Ae93320` | ERC-20 Token |
| RewardDistribution | `0xc7D623Ff9296a64E41Cb5D06E2007CbE730605eB` | Phân phối phần thưởng |
| CertificateNFT | `0x2B8466B458700653Ae74aFD22c19e05D1585501f` | NFT Chứng chỉ |
| CoursePayment | `0x51A25B55a57F3e4f628092dEa7A1505868480ca3` | Thanh toán bằng LHT |

### 3.4. Cơ chế phần thưởng

| Hoạt động | Phần thưởng | Điều kiện |
|-----------|-------------|-----------|
| Hoàn thành bài học | 10 LHT | Xem ít nhất 30 giây |
| Làm quiz | 10-50 LHT | Điểm >= 70% (tính theo điểm) |
| Hoàn thành khóa học | 200 LHT | Hoàn thành tất cả bài học và quiz |
| Viết review | 5 LHT | Review chất lượng |
| Tham gia forum | 3 LHT | Trả lời câu hỏi |
| Chuỗi đăng nhập | 20-30+ LHT | Ngày 1: 20 LHT, mỗi ngày tiếp theo: +10 LHT |

### 3.5. Tính năng đã triển khai

**Core Features:**
- ✅ ERC-20 Token (LHT) với mint và burn
- ✅ Reward Distribution System với 6 loại phần thưởng
- ✅ Wallet Connection (MetaMask)
- ✅ NFT Certificates cho hoàn thành khóa học
- ✅ LHT Payment cho khóa học
- ✅ LHT Discount (tối đa 30% giá trị đơn hàng)

**Advanced Features:**
- ✅ Video Watch Time Tracking (30s minimum)
- ✅ Quiz Attempt Limits và Score Lock (>= 70%)
- ✅ Essay Quiz Manual Grading
- ✅ Course Completion Logic (lessons + quizzes)
- ✅ Login Streak Tracking
- ✅ Token Approval System
- ✅ Self-Transfer Prevention (burn address)

### 3.6. Kiến trúc hệ thống

```
┌─────────────────────────────────────────┐
│         FRONTEND (React.js)             │
│  - MetaMask Integration                  │
│  - Blockchain Context                    │
│  - Reward Display                        │
│  - Payment & Discount UI                 │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────────┐
│      BACKEND (Node.js/Express)           │
│  - Blockchain Service                    │
│  - Reward Service                        │
│  - Payment & Discount Services           │
│  - Database (PostgreSQL)                 │
└──────────────┬──────────────────────────┘
               │ RPC Calls
┌──────────────▼──────────────────────────┐
│    BLOCKCHAIN (Polygon Amoy)            │
│  - Smart Contracts                       │
│  - Token Transactions                   │
│  - Reward Distribution                  │
└─────────────────────────────────────────┘
```

### 3.7. Database Schema

**Bảng mới:**
- `walletaddresses` - Lưu địa chỉ ví
- `tokentransactions` - Lưu lịch sử giao dịch
- `rewardsearned` - Lưu phần thưởng đã nhận
- `nftcertificates` - Lưu NFT chứng chỉ

**Bảng đã mở rộng:**
- `users` - Thêm `lastlogin`, `currentstreak`
- `lessonprogress` - Thêm `watchtime`
- `quizzes` - Thêm `quiztype`, `maxattempts`
- `quizsessions` - Thêm `isgraded`, `gradedby`, `gradedat`, `teachercomment`
- `quizanswers` - Thêm `essayanswer`, cho phép `selectedoptionid` NULL
- `orders` - Thêm `discountedamount`

---

## 4. CÂU HỎI VÀ TRẢ LỜI MẪU CHO BÁO CÁO

### 4.1. Câu hỏi về Smart Contracts

#### Q1: Tại sao bạn chọn Polygon thay vì Ethereum?
**Trả lời mẫu:**
"Em chọn Polygon vì:
1. **Chi phí thấp:** Gas fee trên Polygon rẻ hơn Ethereum hàng trăm lần, phù hợp với ứng dụng giáo dục có nhiều giao dịch nhỏ
2. **Tốc độ cao:** Polygon có block time ~2 giây và throughput cao, đảm bảo trải nghiệm người dùng tốt
3. **Tương thích với Ethereum:** Polygon tương thích với EVM, có thể sử dụng các công cụ và thư viện của Ethereum
4. **Môi trường testnet ổn định:** Polygon Amoy Testnet ổn định và dễ sử dụng cho development"

#### Q2: Tại sao bạn sử dụng OpenZeppelin Contracts?
**Trả lời mẫu:**
"Em sử dụng OpenZeppelin Contracts vì:
1. **Đã được audit:** Các contracts đã được kiểm tra bảo mật bởi các chuyên gia
2. **Tiết kiệm thời gian:** Không cần implement lại các chức năng cơ bản như ERC-20, ERC-721
3. **Tuân thủ standards:** Đảm bảo tuân thủ các token standards (ERC-20, ERC-721)
4. **Documentation đầy đủ:** Có tài liệu chi tiết và ví dụ rõ ràng"

#### Q3: Làm thế nào bạn ngăn chặn việc claim phần thưởng nhiều lần?
**Trả lời mẫu:**
"Em sử dụng mapping trong smart contract để track các phần thưởng đã claim:
```solidity
mapping(address => mapping(string => mapping(uint256 => bool))) public rewardsClaimed;
```
- Format: `rewardsClaimed[user][activityType][activityId] = true/false`
- Trước khi mint token, contract kiểm tra `rewardsClaimed` để đảm bảo chưa claim
- Sau khi mint thành công, set `rewardsClaimed = true`
- Điều này đảm bảo mỗi hoạt động chỉ được thưởng một lần"

#### Q4: Tại sao bạn set max supply là 1 tỷ LHT?
**Trả lời mẫu:**
"Em set max supply là 1 tỷ LHT vì:
1. **Đủ cho nhiều người dùng:** Với 1 tỷ LHT, có thể phục vụ hàng triệu người dùng
2. **Kiểm soát lạm phát:** Max supply giúp kiểm soát tổng số token trong hệ thống
3. **Tính toán phần thưởng:** Với các mức phần thưởng hiện tại (10-200 LHT), 1 tỷ LHT đủ cho nhiều năm hoạt động
4. **Có thể điều chỉnh:** Nếu cần, có thể deploy contract mới với max supply khác"

### 4.2. Câu hỏi về Backend Integration

#### Q5: Làm thế nào backend tương tác với blockchain?
**Trả lời mẫu:**
"Backend tương tác với blockchain thông qua:
1. **Ethers.js:** Sử dụng Ethers.js v6 để tạo provider và signer
2. **RPC Endpoint:** Kết nối với Polygon Amoy qua RPC endpoint (Alchemy)
3. **Contract ABI:** Load ABI từ artifacts sau khi compile
4. **Private Key:** Sử dụng private key của backend wallet để sign transactions
5. **Service Layer:** Tất cả tương tác được đóng gói trong `blockchain.service.js` để dễ quản lý và test"

#### Q6: Làm thế nào bạn xử lý lỗi khi giao dịch blockchain fail?
**Trả lời mẫu:**
"Em xử lý lỗi theo các tầng:
1. **Smart Contract Level:** Sử dụng `require()` và `revert()` với thông báo rõ ràng
2. **Backend Service Level:** 
   - Try-catch để bắt lỗi từ blockchain
   - Log chi tiết để debug
   - Trả về error message thân thiện với user
3. **Database Level:** 
   - Sử dụng transactions để đảm bảo data consistency
   - Rollback nếu blockchain call fail
4. **Frontend Level:**
   - Hiển thị thông báo lỗi rõ ràng
   - Cho phép user retry nếu cần"

#### Q7: Tại sao bạn lưu transaction hash vào database?
**Trả lời mẫu:**
"Em lưu transaction hash vào database vì:
1. **Audit Trail:** Có thể tra cứu lại mọi giao dịch đã thực hiện
2. **Verification:** Có thể verify transaction trên blockchain explorer
3. **Debugging:** Dễ dàng debug khi có vấn đề
4. **User Experience:** User có thể xem lịch sử giao dịch trên frontend
5. **Compliance:** Đáp ứng yêu cầu minh bạch trong hệ thống blockchain"

### 4.3. Câu hỏi về Frontend Integration

#### Q8: Làm thế nào bạn tích hợp MetaMask vào frontend?
**Trả lời mẫu:**
"Em tích hợp MetaMask qua các bước:
1. **Check MetaMask:** Kiểm tra `window.ethereum` có tồn tại không
2. **Request Connection:** Gọi `ethereum.request({ method: 'eth_requestAccounts' })`
3. **Network Check:** Kiểm tra và chuyển sang Polygon Amoy nếu cần
4. **Provider & Signer:** Sử dụng Ethers.js để tạo provider và signer từ MetaMask
5. **State Management:** Lưu wallet address và connection status vào BlockchainContext
6. **Error Handling:** Xử lý các lỗi như user từ chối connection, network mismatch"

#### Q9: Tại sao bạn cần approve tokens trước khi sử dụng?
**Trả lời mẫu:**
"Approve tokens là cơ chế bảo mật của ERC-20:
1. **Security:** Ngăn chặn contracts/spenders tự ý lấy tokens của user
2. **User Control:** User phải explicitly approve số lượng token muốn cho phép
3. **One-time Setup:** Chỉ cần approve một lần, có thể dùng nhiều lần (nếu approve đủ)
4. **Trong hệ thống:**
   - User approve backend wallet để có thể transfer LHT cho discount
   - User approve CoursePayment contract để có thể thanh toán bằng LHT
   - Mỗi approval là một transaction riêng, user phải confirm trong MetaMask"

#### Q10: Làm thế nào bạn xử lý khi user chưa kết nối ví?
**Trả lời mẫu:**
"Em xử lý theo các trường hợp:
1. **Load từ Database:** Nếu user đã kết nối ví trước đó, load wallet address từ database
2. **Hiển thị số dư:** Vẫn hiển thị số dư LHT từ database/blockchain
3. **Prompt Connection:** Hiển thị button để kết nối ví nếu chưa có
4. **Graceful Degradation:** Các tính năng không cần ví vẫn hoạt động bình thường
5. **Error Messages:** Thông báo rõ ràng khi cần ví để thực hiện action"

### 4.4. Câu hỏi về Security

#### Q11: Làm thế nào bạn đảm bảo tính bảo mật của hệ thống?
**Trả lời mẫu:**
"Em đảm bảo bảo mật ở nhiều tầng:
1. **Smart Contracts:**
   - Sử dụng OpenZeppelin Contracts (đã được audit)
   - AccessControl để quản lý quyền
   - Input validation với `require()`
   - Double-claiming prevention

2. **Backend:**
   - Authentication middleware
   - Role-based access control
   - Input validation và sanitization
   - Private key được lưu trong .env (không commit lên git)
   - Transaction rollback khi có lỗi

3. **Frontend:**
   - MetaMask connection validation
   - Network check (chỉ cho phép Polygon Amoy)
   - Error handling cho các giao dịch
   - Không lưu private key trên frontend"

#### Q12: Làm thế nào bạn xử lý private key của backend?
**Trả lời mẫu:**
"Em xử lý private key an toàn:
1. **Environment Variables:** Lưu trong file `.env` (không commit lên git)
2. **Gitignore:** Đảm bảo `.env` trong `.gitignore`
3. **Read-only:** Chỉ backend đọc private key, không expose ra frontend
4. **Single Purpose:** Private key chỉ dùng để sign transactions từ backend
5. **Best Practice:** Tuân thủ best practices về key management"

### 4.5. Câu hỏi về Performance & Scalability

#### Q13: Làm thế nào bạn tối ưu gas fees?
**Trả lời mẫu:**
"Em tối ưu gas fees bằng cách:
1. **Chọn Polygon:** Polygon có gas fee thấp hơn Ethereum hàng trăm lần
2. **Batch Operations:** Nếu có thể, batch nhiều operations vào một transaction
3. **Events thay vì Storage:** Sử dụng events để log thay vì lưu vào storage khi có thể
4. **Optimize Storage:** Sử dụng `uint256` thay vì `string` khi có thể
5. **Gas Estimation:** Estimate gas trước khi gửi transaction (mặc dù đôi khi bỏ qua để tránh RPC errors)"

#### Q14: Hệ thống có thể scale như thế nào?
**Trả lời mẫu:**
"Hệ thống có thể scale theo các cách:
1. **Blockchain Layer:** Polygon có thể xử lý hàng nghìn giao dịch mỗi giây
2. **Backend Layer:** 
   - Có thể scale horizontally (thêm servers)
   - Database có thể scale với read replicas
   - Caching để giảm database load

3. **Frontend Layer:**
   - CDN để serve static files
   - Code splitting để giảm bundle size
   - Lazy loading cho các components

4. **Future Improvements:**
   - Batch rewards distribution
   - Layer 2 solutions nếu cần
   - Off-chain computation với on-chain verification"

### 4.6. Câu hỏi về Business Logic

#### Q15: Tại sao bạn giới hạn LHT discount ở 30%?
**Trả lời mẫu:**
"Em giới hạn ở 30% vì:
1. **Bảo vệ doanh thu:** Đảm bảo nền tảng vẫn có doanh thu từ các khóa học
2. **Khuyến khích thanh toán:** User vẫn cần thanh toán ít nhất 70% bằng VNPay
3. **Kiểm soát token economy:** Tránh việc user chỉ dùng LHT để mua khóa học, không tạo giá trị cho token
4. **Có thể điều chỉnh:** Có thể thay đổi percentage này trong tương lai nếu cần"

#### Q16: Làm thế nào bạn tính toán phần thưởng cho quiz?
**Trả lời mẫu:**
"Em tính toán phần thưởng quiz theo công thức:
- Base reward: 10 LHT
- Bonus: `(score - 70) * 10 / 30` LHT
- Total: `10 + bonus` LHT, tối đa 50 LHT

Ví dụ:
- Score 70%: 10 LHT
- Score 85%: 10 + (85-70)*10/30 = 15 LHT
- Score 100%: 10 + (100-70)*10/30 = 20 LHT (nhưng cap ở 50 LHT)

Công thức này khuyến khích user đạt điểm cao hơn."

#### Q17: Tại sao bạn yêu cầu xem video ít nhất 30 giây?
**Trả lời mẫu:**
"Em yêu cầu 30 giây vì:
1. **Chống gian lận:** Ngăn user chỉ click 'Complete' mà không xem video
2. **Đảm bảo chất lượng:** User phải thực sự xem một phần video để hiểu nội dung
3. **Cân bằng:** 30 giây là đủ để user có trải nghiệm nhưng không quá khó
4. **Có thể điều chỉnh:** Có thể thay đổi threshold này trong tương lai"

### 4.7. Câu hỏi về Testing & Deployment

#### Q18: Bạn đã test hệ thống như thế nào?
**Trả lời mẫu:**
"Em đã test ở nhiều tầng:
1. **Smart Contracts:**
   - Test trên local Hardhat network
   - Test các edge cases (double-claiming, insufficient balance, etc.)
   - Verify logic tính toán phần thưởng

2. **Backend:**
   - Test API endpoints với Postman
   - Test error handling
   - Test transaction rollback

3. **Frontend:**
   - Test wallet connection
   - Test approval flow
   - Test payment flow
   - Test UI/UX

4. **Integration:**
   - Test end-to-end flow (complete lesson → receive reward)
   - Test payment với LHT discount
   - Test các edge cases"

#### Q19: Bạn đã gặp những vấn đề gì trong quá trình phát triển?
**Trả lời mẫu:**
"Em đã gặp một số vấn đề:
1. **RPC Endpoint Issues:** Một số RPC endpoints không hoạt động → Giải pháp: Sử dụng Alchemy RPC với API key
2. **Gas Estimation Errors:** Gas estimation đôi khi fail → Giải pháp: Bỏ qua estimation, để MetaMask tự xử lý
3. **Address Mismatch:** Approve với một address nhưng check với address khác → Giải pháp: Dùng signer address để check
4. **Approval Status Not Updating:** Transaction thành công nhưng frontend không update → Giải pháp: Thêm retry logic và manual refresh button
5. **Self-Transfer Issue:** User transfer LHT cho chính mình → Giải pháp: Dùng burn address khi user = treasury"

### 4.8. Câu hỏi về Future Work

#### Q20: Bạn có kế hoạch phát triển gì tiếp theo?
**Trả lời mẫu:**
"Em có kế hoạch:
1. **Short-term:**
   - Tối ưu gas fees (batch transactions)
   - Cải thiện UX (wallet abstraction, social login)
   - Thêm tính năng staking LHT

2. **Long-term:**
   - Multi-chain support (Ethereum, BSC, etc.)
   - DeFi integration (liquidity pools, yield farming)
   - Governance (DAO) để community quyết định
   - Advanced gamification (leaderboard, achievements)

3. **Technical:**
   - Unit tests cho smart contracts
   - Integration tests
   - Performance optimization
   - Security audit"

### 4.9. Câu hỏi về Technical Details

#### Q21: Tại sao bạn dùng ERC-20 và ERC-721?
**Trả lời mẫu:**
"Em sử dụng:
- **ERC-20 cho LHT token:** Vì đây là fungible token (có thể thay thế), mỗi LHT có giá trị như nhau. ERC-20 là standard phổ biến nhất, tương thích với hầu hết các wallet và DEX.
- **ERC-721 cho NFT chứng chỉ:** Vì mỗi chứng chỉ là unique (không thể thay thế), mỗi chứng chỉ đại diện cho một khóa học cụ thể mà user đã hoàn thành. ERC-721 cho phép lưu trữ metadata riêng cho mỗi NFT."

#### Q22: Làm thế nào bạn đảm bảo tính chính xác của phần thưởng?
**Trả lời mẫu:**
"Em đảm bảo tính chính xác bằng cách:
1. **Backend Validation:** Kiểm tra điều kiện trước khi gọi smart contract (ví dụ: watchtime >= 30s, score >= 70%)
2. **Smart Contract Validation:** Contract cũng kiểm tra lại (ví dụ: score >= 70 trong distributeQuizReward)
3. **Double-claiming Prevention:** Mapping trong contract ngăn chặn claim nhiều lần
4. **Database Records:** Lưu mọi phần thưởng vào database để có thể audit
5. **Events:** Mọi phần thưởng đều emit event, có thể query trên blockchain"

#### Q23: Làm thế nào bạn xử lý khi blockchain network bị down?
**Trả lời mẫu:**
"Em xử lý bằng cách:
1. **Error Handling:** Catch và log lỗi từ blockchain calls
2. **Retry Logic:** Retry với exponential backoff
3. **Graceful Degradation:** Hệ thống vẫn hoạt động, chỉ phần blockchain bị ảnh hưởng
4. **User Notification:** Thông báo rõ ràng cho user về vấn đề
5. **Fallback:** Có thể lưu pending transactions và retry sau
6. **Monitoring:** Log mọi lỗi để có thể phát hiện và xử lý sớm"

#### Q24: Tại sao bạn không lưu private key trên frontend?
**Trả lời mẫu:**
"Em không lưu private key trên frontend vì:
1. **Security Risk:** Frontend code có thể bị expose, private key sẽ bị lộ
2. **Best Practice:** Private key chỉ nên được lưu trên backend hoặc trong hardware wallet
3. **User Control:** User nên tự quản lý private key thông qua MetaMask
4. **Separation of Concerns:** Frontend chỉ để hiển thị và tương tác, không nên xử lý sensitive data
5. **Compliance:** Tuân thủ các best practices về key management"

### 4.10. Câu hỏi về Implementation

#### Q25: Bạn đã deploy contracts như thế nào?
**Trả lời mẫu:**
"Em deploy contracts qua các bước:
1. **Compile:** `npm run compile` để compile Solidity code
2. **Configure:** Setup RPC endpoint và private key trong `.env`
3. **Deploy:** `npm run deploy:testnet` để deploy lên Polygon Amoy
4. **Verify:** Kiểm tra contract addresses trên PolygonScan
5. **Grant Roles:** Grant MINTER_ROLE, DISTRIBUTOR_ROLE cho các contracts
6. **Update .env:** Cập nhật contract addresses vào `.env`
7. **Test:** Test các functions của contracts"

#### Q26: Làm thế nào bạn test smart contracts?
**Trả lời mẫu:**
"Em test smart contracts bằng cách:
1. **Local Testing:** Test trên Hardhat local network trước
2. **Manual Testing:** Deploy lên testnet và test thủ công
3. **Integration Testing:** Test qua backend API
4. **Edge Cases:** Test các trường hợp như double-claiming, insufficient balance
5. **Verification:** Verify contracts trên PolygonScan để xem source code
6. **Future:** Có kế hoạch viết unit tests với Hardhat testing framework"

#### Q27: Bạn xử lý lỗi transaction như thế nào?
**Trả lời mẫu:**
"Em xử lý lỗi transaction theo các tầng:
1. **Smart Contract:** Sử dụng `require()` với thông báo rõ ràng
2. **Backend:** 
   - Try-catch để bắt lỗi
   - Log chi tiết để debug
   - Rollback database transaction nếu blockchain call fail
   - Trả về error message thân thiện
3. **Frontend:**
   - Hiển thị thông báo lỗi rõ ràng
   - Cho phép user retry
   - Hướng dẫn user cách xử lý
4. **User Experience:** 
   - Không để user mất tiền nếu transaction fail
   - Đảm bảo data consistency giữa database và blockchain"

### 4.11. Câu hỏi về Business Model

#### Q28: Làm thế nào bạn đảm bảo tính bền vững của token economy?
**Trả lời mẫu:**
"Em đảm bảo tính bền vững bằng cách:
1. **Max Supply:** Giới hạn tổng cung ở 1 tỷ LHT
2. **Burn Mechanism:** Burn tokens khi sử dụng để thanh toán, giảm supply
3. **Reward Limits:** Giới hạn phần thưởng hợp lý (10-200 LHT)
4. **Usage Incentive:** Khuyến khích sử dụng LHT (discount, payment) để tạo giá trị
5. **Future Plans:** Có kế hoạch staking, governance để tạo utility cho token
6. **Monitoring:** Theo dõi token distribution và usage để điều chỉnh"

#### Q29: Tại sao bạn không cho phép thanh toán 100% bằng LHT?
**Trả lời mẫu:**
"Em giới hạn ở 30% vì:
1. **Doanh thu:** Đảm bảo nền tảng vẫn có doanh thu từ VNPay
2. **Token Value:** Tạo giá trị cho token nhưng không làm token trở thành currency chính
3. **Balance:** Cân bằng giữa reward và payment
4. **Future Flexibility:** Có thể điều chỉnh percentage này trong tương lai
5. **User Behavior:** Khuyến khích user vừa kiếm LHT vừa thanh toán bằng tiền thật"

### 4.12. Câu hỏi về Security

#### Q30: Làm thế nào bạn đảm bảo smart contracts không bị hack?
**Trả lời mẫu:**
"Em đảm bảo bảo mật bằng cách:
1. **OpenZeppelin:** Sử dụng contracts đã được audit
2. **Access Control:** Sử dụng AccessControl để quản lý quyền
3. **Input Validation:** Validate tất cả inputs với `require()`
4. **No Reentrancy:** Các functions không có reentrancy risk
5. **Simple Logic:** Giữ logic đơn giản, dễ audit
6. **Future:** Có kế hoạch security audit trước khi deploy mainnet"

#### Q31: Làm thế nào bạn bảo vệ backend wallet?
**Trả lời mẫu:**
"Em bảo vệ backend wallet bằng cách:
1. **Environment Variables:** Private key chỉ lưu trong `.env`, không commit lên git
2. **Gitignore:** Đảm bảo `.env` trong `.gitignore`
3. **Limited Permissions:** Backend wallet chỉ có quyền cần thiết (DISTRIBUTOR_ROLE, PAYMENT_HANDLER_ROLE)
4. **Monitoring:** Log mọi transaction để có thể phát hiện bất thường
5. **Best Practices:** Tuân thủ các best practices về key management
6. **Future:** Có kế hoạch sử dụng hardware wallet hoặc multi-sig cho mainnet"

---

## 12. DEMO SCRIPT CHO BÁO CÁO

### 12.1. Demo Flow

**Bước 1: Kết nối ví**
- Mở trang web
- Click "Kết nối ví"
- MetaMask popup → Chọn account → Connect
- Hiển thị wallet address và số dư LHT

**Bước 2: Hoàn thành bài học**
- Vào khóa học
- Xem video (>= 30 giây)
- Click "Hoàn thành bài học"
- Hiển thị thông báo: "Nhận 10 LHT!"
- Kiểm tra số dư tăng lên

**Bước 3: Làm quiz**
- Vào quiz
- Trả lời câu hỏi
- Submit → Nhận điểm
- Nếu >= 70% → Nhận 10-50 LHT
- Hiển thị thông báo reward

**Bước 4: Sử dụng LHT discount**
- Vào checkout
- Chọn "Sử dụng LHT để giảm giá"
- Nhập số LHT muốn dùng
- Click "Approve X LHT"
- MetaMask popup → Confirm
- Đợi approval → Hiển thị "✓ Đã approve"
- Thanh toán VNPay → LHT được trừ sau thanh toán

**Bước 5: Xem rewards**
- Vào trang "Rewards"
- Xem số dư LHT
- Xem thống kê phần thưởng
- Xem lịch sử giao dịch
- Claim streak reward nếu có

---

## 13. TÀI LIỆU THAM KHẢO CHO BÁO CÁO

1. Ethereum Foundation. (2023). *Ethereum Whitepaper*
2. OpenZeppelin. (2024). *OpenZeppelin Contracts Documentation*
3. Polygon Technology. (2024). *Polygon Documentation*
4. Solidity Documentation. (2024). *Solidity Programming Language*
5. ERC-20 Token Standard. (2015). *EIP-20*
6. ERC-721 Non-Fungible Token Standard. (2018). *EIP-721*
7. Hardhat. (2024). *Hardhat Documentation*
8. Ethers.js. (2024). *Ethers.js Documentation*
9. MetaMask. (2024). *MetaMask Documentation*

---

**Ngày tổng hợp:** 30/11/2024  
**Repository:** https://github.com/NguyenDuyViet2602/Learn-Hub  
**Branch:** `feature/blockchain-learn-to-earn`

---

## 5. THỐNG KÊ CODE

### 5.1. Số lượng files

- **Smart Contracts:** 4 files
- **Backend Services:** 4 files
- **Backend Controllers:** 1 file
- **Backend Routes:** 2 files
- **Backend Models:** 4 files
- **Backend Migrations:** 4 files
- **Backend Scripts:** 5+ files
- **Frontend Components:** 1 file
- **Frontend Contexts:** 1 file
- **Frontend Pages:** 2 files mới + 4 files enhanced
- **Frontend Services/Utils:** 3 files

**Tổng:** ~35+ files liên quan đến blockchain

### 5.2. Lines of Code

- **Smart Contracts:** ~500+ lines
- **Backend:** ~2,500+ lines
- **Frontend:** ~3,000+ lines
- **Total:** ~6,000+ lines

### 5.3. API Endpoints

- **Blockchain APIs:** 8+ endpoints
- **Payment APIs:** 4+ endpoints (LHT related)
- **Total:** 12+ endpoints mới

---

## 6. ĐIỂM MẠNH CỦA ĐỀ TÀI

1. **Tính thực tiễn cao:** Hệ thống hoàn chỉnh, có thể sử dụng ngay
2. **Tích hợp tốt:** Tích hợp mượt mà với hệ thống hiện có
3. **Bảo mật:** Sử dụng các best practices và libraries đã được audit
4. **User Experience:** Giao diện thân thiện, dễ sử dụng
5. **Tính minh bạch:** Tất cả giao dịch đều trên blockchain, có thể verify
6. **Scalable:** Có thể mở rộng trong tương lai

---

## 7. HẠN CHẾ VÀ HƯỚNG KHẮC PHỤC

1. **Gas Fees:** Vẫn có chi phí cho mỗi giao dịch → Giải pháp: Batch transactions, Layer 2
2. **Network Dependency:** Phụ thuộc vào Polygon network → Giải pháp: Multi-chain support
3. **User Experience:** Cần MetaMask và hiểu về blockchain → Giải pháp: Wallet abstraction, hướng dẫn rõ ràng
4. **Testing:** Chưa có unit tests đầy đủ → Giải pháp: Viết tests trong tương lai

---

## 8. CHI TIẾT CÁC FILE QUAN TRỌNG

### 8.1. Smart Contracts

#### LearnHubToken.sol
**Vị trí:** `learnhub-backend/contracts/LearnHubToken.sol`  
**Số dòng:** ~70 lines  
**Dependencies:** OpenZeppelin ERC20, ERC20Burnable, AccessControl  
**Chức năng chính:**
- Mint tokens khi phân phối phần thưởng
- Burn tokens khi sử dụng để thanh toán
- Quản lý max supply (1 tỷ LHT)
- Access control cho MINTER_ROLE và BURNER_ROLE

#### RewardDistribution.sol
**Vị trí:** `learnhub-backend/contracts/RewardDistribution.sol`  
**Số dòng:** ~220 lines  
**Dependencies:** OpenZeppelin AccessControl, LearnHubToken  
**Chức năng chính:**
- 6 hàm phân phối phần thưởng khác nhau
- Double-claiming prevention với mapping
- Configurable reward amounts
- Events để log mọi phần thưởng

#### CertificateNFT.sol
**Vị trí:** `learnhub-backend/contracts/CertificateNFT.sol`  
**Số dòng:** ~120 lines  
**Dependencies:** OpenZeppelin ERC721, ERC721URIStorage, AccessControl  
**Chức năng chính:**
- Mint NFT chứng chỉ khi hoàn thành khóa học
- Lưu trữ metadata URI
- Duplicate prevention (mỗi user chỉ 1 NFT per course)

#### CoursePayment.sol
**Vị trí:** `learnhub-backend/contracts/CoursePayment.sol`  
**Số dòng:** ~120 lines  
**Dependencies:** OpenZeppelin AccessControl, LearnHubToken  
**Chức năng chính:**
- Xử lý thanh toán khóa học bằng LHT
- Quản lý exchange rate (VND/LHT)
- Double-payment prevention
- Transfer tokens từ buyer đến treasury

### 8.2. Backend Services

#### blockchain.service.js
**Vị trí:** `learnhub-backend/src/services/blockchain.service.js`  
**Số dòng:** ~930 lines  
**Chức năng:**
- Khởi tạo kết nối blockchain (provider, signer, contracts)
- Tất cả các hàm tương tác với smart contracts
- Quản lý wallet addresses
- Xử lý token transfers và approvals
- Error handling và logging

**Các hàm quan trọng:**
- `initializeBlockchain()` - Khởi tạo
- `connectWallet()` - Kết nối ví
- `getTokenBalance()` - Lấy số dư
- `distribute*Reward()` - Phân phối phần thưởng (6 loại)
- `transferTokensForDiscount()` - Transfer cho discount
- `payCourseWithLHT()` - Thanh toán bằng LHT

#### reward.service.js
**Vị trí:** `learnhub-backend/src/services/reward.service.js`  
**Số dòng:** ~300+ lines  
**Chức năng:**
- Tính toán số lượng phần thưởng
- Gọi blockchain service để phân phối
- Lưu vào database (rewardsearned, tokentransactions)
- Xử lý edge cases

#### lht-payment.service.js
**Vị trí:** `learnhub-backend/src/services/lht-payment.service.js`  
**Số dòng:** ~125 lines  
**Chức năng:**
- Tính toán LHT cần thiết
- Kiểm tra balance và approval
- Xử lý thanh toán bằng LHT

#### lht-discount.service.js
**Vị trí:** `learnhub-backend/src/services/lht-discount.service.js`  
**Số dòng:** ~190 lines  
**Chức năng:**
- Tính toán max LHT có thể dùng (30% limit)
- Áp dụng discount
- Transfer/burn LHT sau thanh toán

### 8.3. Frontend Components

#### WalletConnect.jsx
**Vị trí:** `learnhub-frontend/src/components/WalletConnect.jsx`  
**Chức năng:**
- Kết nối MetaMask
- Hiển thị wallet address và balance
- Network switching

#### BlockchainContext.jsx
**Vị trí:** `learnhub-frontend/src/contexts/BlockchainContext.jsx`  
**Chức năng:**
- Global state management cho blockchain
- Auto-load wallet từ database
- Provide state cho các components

#### BlockchainRewards.jsx
**Vị trí:** `learnhub-frontend/src/pages/BlockchainRewards.jsx`  
**Chức năng:**
- Hiển thị số dư LHT
- Thống kê phần thưởng
- Lịch sử giao dịch
- Claim streak reward

#### ethers-helper.js
**Vị trí:** `learnhub-frontend/src/utils/ethers-helper.js`  
**Số dòng:** ~450 lines  
**Chức năng:**
- Network checking và switching
- Token approval checking và approval
- Provider và signer management
- Error handling

---

## 9. WORKFLOW CỦA CÁC TÍNH NĂNG

### 9.1. Workflow: Hoàn thành bài học và nhận phần thưởng

```
1. User xem video (>= 30 giây)
   ↓
2. Frontend gọi API: POST /api/v1/progress/watch-time
   ↓
3. Backend update watchtime trong lessonprogress
   ↓
4. User click "Hoàn thành bài học"
   ↓
5. Frontend gọi API: POST /api/v1/progress/complete/:lessonId
   ↓
6. Backend (progress.service.js):
   - Mark lesson as complete
   - Commit transaction
   ↓
7. Backend (reward.service.js):
   - Calculate reward (10 LHT)
   - Call blockchain.service.js
   ↓
8. Backend (blockchain.service.js):
   - Call RewardDistribution.distributeLessonReward()
   ↓
9. Smart Contract:
   - Check rewardsClaimed mapping
   - Mint 10 LHT to user
   - Emit RewardDistributed event
   ↓
10. Backend:
    - Save to rewardsearned table
    - Save to tokentransactions table
    ↓
11. Frontend:
    - Display success message
    - Update balance display
```

### 9.2. Workflow: Thanh toán với LHT Discount

```
1. User chọn "Sử dụng LHT để giảm giá"
   ↓
2. Frontend load max LHT discount
   ↓
3. User nhập số LHT muốn dùng
   ↓
4. Frontend check approval status
   ↓
5. Nếu chưa approve:
   - User bấm "Approve X LHT"
   - MetaMask popup → User confirm
   - Transaction sent → Wait confirmation
   - Check approval status (retry logic)
   ↓
6. User bấm "Thanh toán với VNPay"
   ↓
7. Backend tạo order với discountedamount
   ↓
8. User thanh toán VNPay
   ↓
9. VNPay callback → Backend update order status
   ↓
10. Backend (lht-discount.service.js):
    - Call blockchain.service.transferTokensForDiscount()
    ↓
11. Backend (blockchain.service.js):
    - Check allowance
    - Transfer LHT from user to treasury/burn address
    ↓
12. Backend:
    - Save transaction to tokentransactions
    - Update order status
```

### 9.3. Workflow: Hoàn thành khóa học

```
1. User hoàn thành tất cả bài học (watchtime >= 30s)
   ↓
2. User pass tất cả quiz (>= 70%)
   ↓
3. Backend (progress.service.js):
   - Check all lessons completed
   - Check all quizzes passed
   - Create coursecompletion record
   ↓
4. Backend (reward.service.js):
   - Calculate course reward (200 LHT)
   - Call blockchain.service
   ↓
5. Backend (blockchain.service.js):
   - Call RewardDistribution.distributeCourseCompletionReward()
   - Call CertificateNFT.mintCertificate()
   ↓
6. Smart Contracts:
   - Mint 200 LHT
   - Mint NFT certificate
   ↓
7. Backend:
   - Save to rewardsearned
   - Save to nftcertificates
   ↓
8. Frontend:
   - Display "Course Completed" badge
   - Show reward notification
```

---

## 10. CÁC VẤN ĐỀ ĐÃ GẶP VÀ GIẢI PHÁP

### 10.1. Smart Contract Issues

| Vấn đề | Giải pháp |
|--------|-----------|
| Solidity version incompatibility | Downgrade từ 0.8.20 xuống 0.8.0 |
| OpenZeppelin API changes | Điều chỉnh code cho phù hợp với v4 |
| RPC endpoint không hoạt động | Sử dụng Alchemy RPC với API key |
| Chain ID mismatch | Cập nhật chainId thành 80002 |
| Insufficient funds | Request testnet tokens từ faucet |

### 10.2. Backend Issues

| Vấn đề | Giải pháp |
|--------|-----------|
| Sequelize Op undefined | Import `Op` từ Sequelize đúng cách |
| Transaction rollback error | Quản lý transaction lifecycle đúng cách |
| Reward không được phân phối | Commit transaction trước khi distribute |
| Quiz answer logic sai | Convert sang Number trước khi so sánh |
| Foreign key constraints | Xóa các bảng liên quan theo thứ tự đúng |

### 10.3. Frontend Issues

| Vấn đề | Giải pháp |
|--------|-----------|
| Balance không hiển thị | Fix API URL và BlockchainContext logic |
| YouTube CORS error | Thêm error handler và sandbox attribute |
| HTML nesting error | Fix cấu trúc HTML |
| Essay quiz không hiển thị textarea | Fix logic trong QuizPlayer |
| Approval status không update | Thêm retry logic và manual refresh |

---

## 11. METRICS VÀ THỐNG KÊ

### 11.1. Code Metrics

- **Total Files:** 35+ files
- **Total Lines:** 6,000+ lines
- **Smart Contracts:** 4 contracts, ~500 lines
- **Backend Services:** 4 services, ~2,500 lines
- **Frontend:** ~3,000 lines

### 11.2. Contract Metrics

- **Total Contracts:** 4
- **Total Functions:** 30+
- **Total Events:** 10+
- **Gas Used (Deployment):** ~0.2 POL

### 11.3. Feature Metrics

- **Reward Types:** 6
- **API Endpoints:** 12+
- **Database Tables:** 4 new + 5 extended
- **Frontend Pages:** 2 new + 4 enhanced
- **Frontend Components:** 1 new

---

**Ngày tổng hợp:** 30/11/2024  
**Repository:** https://github.com/NguyenDuyViet2602/Learn-Hub  
**Branch:** `feature/blockchain-learn-to-earn`

