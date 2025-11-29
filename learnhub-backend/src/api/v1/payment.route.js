const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// POST /api/v1/payment/create-payment-url - Yêu cầu đăng nhập
router.post('/create-payment-url', authMiddleware, paymentController.createPaymentUrl);

// GET /api/v1/payment/vnpay-return - VNPay redirect về (không cần auth)
router.get('/vnpay-return', paymentController.vnpayReturn);

// LHT Payment routes
// GET /api/v1/payment/lht/info/:orderId - Lấy thông tin thanh toán LHT
router.get('/lht/info/:orderId', authMiddleware, paymentController.getLHTPaymentInfo);

// POST /api/v1/payment/lht/pay - Thanh toán bằng LHT
router.post('/lht/pay', authMiddleware, paymentController.payWithLHT);

// GET /api/v1/payment/lht/calculate - Tính toán LHT cần thiết
router.get('/lht/calculate', authMiddleware, paymentController.calculateLHT);

// GET /api/v1/payment/lht/discount/max - Lấy max LHT discount có thể dùng
router.get('/lht/discount/max', authMiddleware, paymentController.getMaxLHTDiscount);

// GET/POST /api/v1/payment/vnpay-ipn - VNPay IPN callback (không cần auth)
router.get('/vnpay-ipn', paymentController.vnpayIpn);
router.post('/vnpay-ipn', paymentController.vnpayIpn);

module.exports = router;

