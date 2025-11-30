# PHÂN CÔNG CÔNG VIỆC BLOCKCHAIN
## CHO NHÓM 4 NGƯỜI

---

## TỔNG QUAN

Dựa trên hệ thống Learn-to-Earn đã triển khai, đề xuất phân công như sau:

---

## PHƯƠNG ÁN 1: PHÂN THEO TẦNG (RECOMMENDED)

### 👤 **Thành viên 1: Smart Contracts Developer**

**Trách nhiệm:**
- ✅ Phát triển và deploy Smart Contracts
- ✅ Viết và test Solidity code
- ✅ Tối ưu gas fees
- ✅ Security audit cơ bản

**Các file phụ trách:**
```
learnhub-backend/contracts/
├── LearnHubToken.sol
├── RewardDistribution.sol
├── CertificateNFT.sol
└── CoursePayment.sol

learnhub-backend/scripts/
├── deploy.js
├── deploy-course-payment.js
├── redeploy-reward-distribution.js
└── update-env.js

learnhub-backend/hardhat.config.js
```

**Công việc cụ thể:**
1. **LearnHubToken.sol:**
   - Implement ERC-20 token với mint và burn
   - Quản lý max supply
   - Access control

2. **RewardDistribution.sol:**
   - Implement 6 loại phần thưởng
   - Double-claiming prevention
   - Events và logging

3. **CertificateNFT.sol:**
   - Implement ERC-721 NFT
   - Metadata URI storage
   - Duplicate prevention

4. **CoursePayment.sol:**
   - Payment processing
   - Exchange rate management
   - Double-payment prevention

5. **Deployment:**
   - Viết deployment scripts
   - Deploy lên testnet
   - Verify contracts trên PolygonScan
   - Grant roles cho contracts

**Kỹ năng cần:**
- Solidity programming
- Hardhat framework
- OpenZeppelin Contracts
- Gas optimization
- Smart contract security

**Deliverables:**
- 4 Smart Contracts đã deploy
- Deployment scripts
- Contract documentation
- Test cases (nếu có)

---

### 👤 **Thành viên 2: Backend Blockchain Integration**

**Trách nhiệm:**
- ✅ Tích hợp Backend với Blockchain
- ✅ Phát triển Blockchain Service
- ✅ API endpoints cho blockchain
- ✅ Database models và migrations

**Các file phụ trách:**
```
learnhub-backend/src/services/
├── blockchain.service.js
├── reward.service.js
├── lht-payment.service.js
└── lht-discount.service.js

learnhub-backend/src/controllers/
└── blockchain.controller.js

learnhub-backend/src/api/v1/
├── blockchain.route.js
└── payment.route.js (enhanced)

learnhub-backend/src/models/
├── walletaddresses.js
├── tokentransactions.js
├── rewardsearned.js
└── nftcertificates.js

learnhub-backend/migrations/
├── add-video-progress-and-quiz-type.sql
├── add-essayanswer-to-quizanswers.sql
├── allow-null-selectedoptionid.sql
└── add-login-streak-fields.sql
```

**Công việc cụ thể:**
1. **blockchain.service.js:**
   - Khởi tạo kết nối blockchain
   - Tương tác với smart contracts
   - Quản lý wallet và transactions
   - Error handling

2. **reward.service.js:**
   - Tính toán phần thưởng
   - Phân phối phần thưởng
   - Lưu vào database

3. **lht-payment.service.js:**
   - Xử lý thanh toán bằng LHT
   - Kiểm tra balance và approval

4. **lht-discount.service.js:**
   - Tính toán LHT discount
   - Transfer/burn LHT sau thanh toán

5. **API Endpoints:**
   - Blockchain APIs (wallet, balance, rewards, transactions)
   - Payment APIs (LHT payment, discount)

6. **Database:**
   - Tạo models cho blockchain data
   - Viết migrations
   - Setup relationships

**Kỹ năng cần:**
- Node.js, Express.js
- Ethers.js
- Sequelize ORM
- PostgreSQL
- RESTful API design

**Deliverables:**
- Blockchain service hoàn chỉnh
- API endpoints đầy đủ
- Database models và migrations
- API documentation

---

### 👤 **Thành viên 3: Frontend Blockchain Integration**

**Trách nhiệm:**
- ✅ Tích hợp Frontend với MetaMask
- ✅ Phát triển Blockchain Context
- ✅ UI/UX cho blockchain features
- ✅ Ethers.js helper functions

**Các file phụ trách:**
```
learnhub-frontend/src/components/
└── WalletConnect.jsx

learnhub-frontend/src/contexts/
└── BlockchainContext.jsx

learnhub-frontend/src/pages/
├── BlockchainRewards.jsx
└── Forum.jsx

learnhub-frontend/src/utils/
└── ethers-helper.js

learnhub-frontend/src/services/
└── blockchain.service.js
```

**Công việc cụ thể:**
1. **WalletConnect.jsx:**
   - Component kết nối MetaMask
   - Network switching
   - Error handling

2. **BlockchainContext.jsx:**
   - Global state management
   - Auto-load wallet từ database
   - Provide state cho components

3. **BlockchainRewards.jsx:**
   - Hiển thị số dư LHT
   - Thống kê phần thưởng
   - Lịch sử giao dịch
   - Claim streak reward

4. **ethers-helper.js:**
   - Network checking
   - Token approval
   - Provider và signer management

5. **Forum.jsx:**
   - Trang forum với reward integration

**Kỹ năng cần:**
- React.js
- Ethers.js
- MetaMask integration
- Context API
- UI/UX design

**Deliverables:**
- Wallet connection component
- Blockchain context
- Rewards page
- Ethers helper utilities
- UI/UX hoàn chỉnh

---

### 👤 **Thành viên 4: Integration & Enhancement**

**Trách nhiệm:**
- ✅ Tích hợp blockchain vào các tính năng hiện có
- ✅ Enhance các pages với blockchain features
- ✅ Testing và bug fixing
- ✅ Documentation

**Các file phụ trách:**
```
learnhub-frontend/src/pages/
├── Checkout.jsx (enhanced với LHT payment & discount)
├── LearnCourse.jsx (enhanced với reward tracking)
├── CourseDetail.jsx (enhanced với review rewards)
└── Teacher.jsx (enhanced với essay quiz grading)

learnhub-backend/src/services/
├── progress.service.js (enhanced)
├── quiz.service.js (enhanced)
├── review.service.js (enhanced)
├── forum.service.js (enhanced)
└── auth.service.js (enhanced với streak)

learnhub-backend/src/controllers/
├── progress.controller.js (enhanced)
├── quiz.controller.js (enhanced)
├── review.controller.js (enhanced)
└── forum.controller.js (enhanced)
```

**Công việc cụ thể:**
1. **Checkout.jsx Enhancement:**
   - Thêm LHT payment option
   - Thêm LHT discount (tối đa 30%)
   - Approval flow UI
   - Payment processing

2. **LearnCourse.jsx Enhancement:**
   - Video watch time tracking
   - Lesson completion với reward
   - Course completion button
   - Reward notifications

3. **Progress Service Enhancement:**
   - Tích hợp reward distribution
   - Course completion logic
   - Watch time tracking

4. **Quiz Service Enhancement:**
   - Quiz rewards
   - Attempt limits
   - Score lock logic

5. **Review & Forum Services:**
   - Review rewards
   - Forum participation rewards

6. **Auth Service:**
   - Login streak tracking
   - Streak reward distribution

7. **Testing:**
   - Integration testing
   - End-to-end testing
   - Bug fixing

8. **Documentation:**
   - Code documentation
   - API documentation
   - User guide

**Kỹ năng cần:**
- Full-stack development
- Integration skills
- Testing
- Documentation
- Problem-solving

**Deliverables:**
- Enhanced pages với blockchain features
- Integration hoàn chỉnh
- Test cases
- Documentation

---

## PHƯƠNG ÁN 2: PHÂN THEO TÍNH NĂNG

### 👤 **Thành viên 1: Token & Rewards System**
- LearnHubToken.sol
- RewardDistribution.sol
- blockchain.service.js (reward functions)
- reward.service.js
- BlockchainRewards.jsx

### 👤 **Thành viên 2: Payment & Discount System**
- CoursePayment.sol
- lht-payment.service.js
- lht-discount.service.js
- Checkout.jsx (LHT features)
- ethers-helper.js

### 👤 **Thành viên 3: NFT & Certificates**
- CertificateNFT.sol
- nftcertificates.js model
- Course completion integration
- LearnCourse.jsx (completion features)

### 👤 **Thành viên 4: Integration & Testing**
- Wallet connection
- BlockchainContext
- Integration với các services hiện có
- Testing và documentation

---

## PHƯƠNG ÁN 3: PHÂN THEO VAI TRÒ

### 👤 **Thành viên 1: Smart Contract Developer**
- Tất cả Smart Contracts
- Deployment scripts
- Contract testing

### 👤 **Thành viên 2: Backend Developer**
- Tất cả Backend services
- API endpoints
- Database models

### 👤 **Thành viên 3: Frontend Developer**
- Tất cả Frontend components
- UI/UX
- MetaMask integration

### 👤 **Thành viên 4: Full-stack Developer / Tester**
- Integration giữa các phần
- Testing
- Bug fixing
- Documentation

---

## KHUYẾN NGHỊ: PHƯƠNG ÁN 1

**Lý do:**
1. **Rõ ràng:** Mỗi người phụ trách một tầng, dễ quản lý
2. **Độc lập:** Có thể làm việc song song, ít conflict
3. **Chuyên sâu:** Mỗi người tập trung vào một lĩnh vực
4. **Dễ test:** Có thể test từng tầng riêng biệt

---

## TIMELINE ĐỀ XUẤT

### Tuần 1: Setup & Planning
- **Thành viên 1:** Setup Hardhat, nghiên cứu OpenZeppelin
- **Thành viên 2:** Setup backend, nghiên cứu Ethers.js
- **Thành viên 3:** Setup frontend, nghiên cứu MetaMask
- **Thành viên 4:** Planning integration, setup testing

### Tuần 2: Core Development
- **Thành viên 1:** Develop và deploy Smart Contracts
- **Thành viên 2:** Develop Blockchain Service và APIs
- **Thành viên 3:** Develop Wallet Connect và Blockchain Context
- **Thành viên 4:** Enhance các pages hiện có

### Tuần 3: Integration
- **Thành viên 1:** Test và fix Smart Contracts
- **Thành viên 2:** Integrate với Frontend
- **Thành viên 3:** Integrate với Backend APIs
- **Thành viên 4:** Integration testing và bug fixing

### Tuần 4: Testing & Documentation
- **Tất cả:** Testing toàn bộ hệ thống
- **Tất cả:** Bug fixing
- **Tất cả:** Documentation
- **Tất cả:** Chuẩn bị báo cáo

---

## CÁCH LÀM VIỆC NHÓM

### 1. Communication
- **Daily Standup:** 15 phút mỗi ngày để sync
- **Git Workflow:** 
  - Mỗi người làm trên branch riêng
  - Merge vào `feature/blockchain-learn-to-earn`
  - Code review trước khi merge

### 2. Code Review
- Mỗi PR cần được review bởi ít nhất 1 người khác
- Focus vào: logic, security, performance

### 3. Testing
- Mỗi người test phần của mình
- Integration testing cùng nhau
- End-to-end testing trước khi demo

### 4. Documentation
- Mỗi người document phần của mình
- Tập hợp lại thành báo cáo chung

---

## CHECKLIST CHO TỪNG THÀNH VIÊN

### ✅ Thành viên 1 (Smart Contracts)
- [ ] LearnHubToken.sol hoàn chỉnh
- [ ] RewardDistribution.sol hoàn chỉnh
- [ ] CertificateNFT.sol hoàn chỉnh
- [ ] CoursePayment.sol hoàn chỉnh
- [ ] Tất cả contracts đã deploy
- [ ] Contracts đã verify trên PolygonScan
- [ ] Roles đã được grant đúng
- [ ] Deployment scripts hoàn chỉnh

### ✅ Thành viên 2 (Backend Integration)
- [ ] blockchain.service.js hoàn chỉnh
- [ ] reward.service.js hoàn chỉnh
- [ ] lht-payment.service.js hoàn chỉnh
- [ ] lht-discount.service.js hoàn chỉnh
- [ ] API endpoints đầy đủ
- [ ] Database models và migrations
- [ ] Error handling đầy đủ
- [ ] API documentation

### ✅ Thành viên 3 (Frontend Integration)
- [ ] WalletConnect.jsx hoàn chỉnh
- [ ] BlockchainContext.jsx hoàn chỉnh
- [ ] BlockchainRewards.jsx hoàn chỉnh
- [ ] ethers-helper.js hoàn chỉnh
- [ ] MetaMask integration hoạt động
- [ ] UI/UX đẹp và thân thiện
- [ ] Error handling đầy đủ

### ✅ Thành viên 4 (Integration & Enhancement)
- [ ] Checkout.jsx enhanced
- [ ] LearnCourse.jsx enhanced
- [ ] Progress service enhanced
- [ ] Quiz service enhanced
- [ ] Review & Forum services enhanced
- [ ] Integration testing
- [ ] Documentation đầy đủ

---

## CÁC VẤN ĐỀ CẦN LƯU Ý

### 1. Dependencies giữa các thành viên
- **Thành viên 2** cần contract addresses từ **Thành viên 1**
- **Thành viên 3** cần API endpoints từ **Thành viên 2**
- **Thành viên 4** cần cả frontend và backend

**Giải pháp:**
- Thành viên 1 deploy sớm và share addresses
- Thành viên 2 tạo API endpoints sớm (có thể mock data trước)
- Thành viên 4 làm integration cuối cùng

### 2. Git Conflicts
- Mỗi người làm trên branch riêng
- Merge thường xuyên để tránh conflicts lớn
- Communication khi có conflicts

### 3. Testing
- Test từng phần riêng biệt
- Integration testing cùng nhau
- Có test plan rõ ràng

---

## TÀI LIỆU THAM KHẢO CHO TỪNG THÀNH VIÊN

### Thành viên 1 (Smart Contracts)
- Solidity Documentation
- OpenZeppelin Contracts
- Hardhat Documentation
- ERC-20, ERC-721 Standards

### Thành viên 2 (Backend)
- Ethers.js Documentation
- Node.js, Express.js
- Sequelize ORM
- PostgreSQL

### Thành viên 3 (Frontend)
- React.js Documentation
- Ethers.js Documentation
- MetaMask Documentation
- Context API

### Thành viên 4 (Integration)
- Full-stack best practices
- Testing methodologies
- Documentation standards

---

## ĐÁNH GIÁ CÔNG VIỆC

### Tiêu chí đánh giá:
1. **Code Quality:** Code sạch, dễ đọc, có comments
2. **Functionality:** Tính năng hoạt động đúng
3. **Testing:** Đã test đầy đủ
4. **Documentation:** Có documentation rõ ràng
5. **Collaboration:** Làm việc nhóm tốt

---

## KẾT LUẬN

Với phân công này, mỗi thành viên sẽ có trách nhiệm rõ ràng và có thể làm việc độc lập. Quan trọng là:
- **Communication:** Giao tiếp thường xuyên
- **Coordination:** Phối hợp tốt giữa các phần
- **Testing:** Test kỹ trước khi integrate
- **Documentation:** Document đầy đủ để dễ maintain

---

**Lưu ý:** Phân công này có thể điều chỉnh tùy theo:
- Kỹ năng của từng thành viên
- Sở thích và thế mạnh
- Thời gian có sẵn
- Mức độ phức tạp của từng phần

