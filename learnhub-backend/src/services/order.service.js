const { sequelize, orders, orderdetails, cart, courses } = require('../models');
const { validatePromotionCode } = require('./promotion.service');
const enrollmentService = require('./enrollment.service');
const notificationService = require('./notification.service');
const lhtDiscountService = require('./lht-discount.service');

/**
 * Tạo một đơn hàng từ giỏ hàng của người dùng.
 * @param {number} userId - ID người dùng.
 * @param {string|null} promotionCode - Áp dụng mã khuyến mại.
 * @param {number|null} lhtDiscountAmount - Số LHT muốn dùng để giảm giá (optional).
 */
const createOrderFromCart = async (userId, promotionCode = null, lhtDiscountAmount = null) => {
  const t = await sequelize.transaction();
  try {
    const cartItems = await cart.findAll({
      where: { userid: userId },
      include: [{ model: courses, as: 'course' }],
      transaction: t,
    });

    if (cartItems.length === 0) {
      throw new Error('Giỏ hàng của bạn đang trống.');
    }

    const originalTotal = cartItems.reduce((sum, item) => sum + item.course.price, 0);
    let finalTotal = originalTotal;
    let discountPercentage = 0;
    let lhtDiscount = 0;
    let discountedAmount = 0;

    // Nếu có mã khuyến mãi, xác thực và tính toán lại tổng tiền
    if (promotionCode) {
        const promotion = await validatePromotionCode(promotionCode);
        discountPercentage = promotion.discountpercentage;
        finalTotal = originalTotal * (1 - discountPercentage / 100);
    }

    // Nếu có LHT discount, tính toán giảm giá
    // LHT chỉ có thể thay thế tối đa 30% giá trị đơn hàng
    if (lhtDiscountAmount && lhtDiscountAmount > 0) {
      try {
        const maxLHT = await lhtDiscountService.getMaxLHTUsable(userId, finalTotal);
        const actualLHT = Math.min(lhtDiscountAmount, maxLHT.maxLHT);
        lhtDiscount = lhtDiscountService.calculateVNDDiscount(actualLHT);
        
        // LHT discount cannot exceed 30% of order total
        const maxDiscountAllowed = (finalTotal * lhtDiscountService.MAX_DISCOUNT_PERCENTAGE) / 100;
        lhtDiscount = Math.min(lhtDiscount, maxDiscountAllowed);
        
        // LHT discount cannot exceed order total (safety check)
        lhtDiscount = Math.min(lhtDiscount, finalTotal);
        finalTotal = Math.max(0, finalTotal - lhtDiscount);
        discountedAmount = lhtDiscount;
      } catch (error) {
        console.warn('Could not apply LHT discount:', error.message);
        // Continue without LHT discount if there's an error (e.g., wallet not connected)
      }
    }

    const newOrder = await orders.create({
      userid: userId,
      totalamount: finalTotal, // Sử dụng tổng tiền cuối cùng (sau promotion và LHT discount)
      status: 'Pending', // Đặt status là Pending khi tạo order, sẽ cập nhật thành Completed sau khi thanh toán
      discountedamount: discountedAmount > 0 ? discountedAmount : null, // Lưu số tiền được giảm từ LHT
    }, { transaction: t });

    // Tạo order details
    const orderDetailsData = cartItems.map(item => ({
        orderid: newOrder.orderid,
        courseid: item.courseid,
        price: item.course.price,
    }));
    await orderdetails.bulkCreate(orderDetailsData, { transaction: t });

    // Store LHT discount amount in order (we'll use a custom field or store in a separate table)
    // For now, we'll store it in a JSON field or use the discountedamount field
    // Actually, we already stored it in discountedamount
    
    // Also store the LHT amount used (we can add a new field or use a note/JSON field)
    // For simplicity, we'll handle LHT discount application when payment is confirmed

    await t.commit();
    
    // Calculate actual LHT amount used
    let lhtAmountUsed = null;
    if (lhtDiscountAmount && lhtDiscountAmount > 0 && lhtDiscount > 0) {
      lhtAmountUsed = lhtDiscount / lhtDiscountService.LHT_TO_VND_RATE;
    }
    
    // Return order with LHT discount info
    return {
      ...newOrder.toJSON(),
      lhtDiscount: lhtDiscount,
      lhtAmountUsed: lhtAmountUsed,
    };
  } catch (error) {
    await t.rollback();
    throw new Error(`Không thể tạo đơn hàng: ${error.message}`);
  }
};

/**
 * Lấy lịch sử đơn hàng của một người dùng.
 */
const getOrdersByUserId = async (userId) => {
  return await orders.findAll({
    where: { userid: userId },
    include: {
      model: orderdetails,
      as: 'orderdetails', // Alias từ association
      include: {
        model: courses,
        as: 'course', // Alias từ association
        attributes: ['coursename', 'imageurl'],
      },
    },
    order: [['createdat', 'DESC']],
  });
};

const getOrderById = async (orderId, userId) => {
  const order = await orders.findOne({
    where: { 
      orderid: orderId,
      userid: userId // Đảm bảo người dùng chỉ xem được đơn hàng của chính họ
    },
    include: {
      model: orderdetails,
      as: 'orderdetails',
      include: {
        model: courses,
        as: 'course',
        attributes: ['coursename', 'imageurl'],
      },
    },
  });

  if (!order) {
    throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.');
  }

  return order;
};

/**
 * Cập nhật trạng thái đơn hàng
 * Nếu status là 'Completed', sẽ tạo enrollment cho tất cả khóa học trong order
 */
const updateOrderStatus = async (orderId, status) => {
  const t = await sequelize.transaction();
  try {
    const order = await orders.findByPk(orderId, {
      include: [{
        model: orderdetails,
        as: 'orderdetails',
        include: [{
          model: courses,
          as: 'course'
        }]
      }],
      transaction: t
    });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng.');
    }

    // Cập nhật status
    await order.update({ status }, { transaction: t });

    // Nếu thanh toán thành công, tạo enrollment và xóa cart
    if (status === 'Completed') {
      // Xóa cart sau khi thanh toán thành công
      await cart.destroy({
        where: { userid: order.userid },
        transaction: t
      });
      for (const detail of order.orderdetails) {
        try {
          // Kiểm tra xem đã enroll chưa
          const { enrollments } = require('../models');
          const existingEnrollment = await enrollments.findOne({
            where: {
              studentid: order.userid,
              courseid: detail.courseid
            },
            transaction: t
          });

          if (!existingEnrollment) {
            // Tạo enrollment (bỏ qua kiểm tra giá vì đã thanh toán)
            await enrollmentService.createEnrollmentFromOrder(
              order.userid,
              detail.courseid,
              t
            );
          }
        } catch (error) {
          console.error(`Error creating enrollment for course ${detail.courseid}:`, error);
          // Tiếp tục với các khóa học khác
        }
      }

      // Apply LHT discount if order has discount
      if (order.discountedamount && order.discountedamount > 0) {
        try {
          // Calculate LHT amount used from discount amount
          const lhtAmountUsed = order.discountedamount / lhtDiscountService.LHT_TO_VND_RATE;
          await lhtDiscountService.applyLHTDiscount(order.userid, orderId, lhtAmountUsed);
        } catch (error) {
          console.error('Error applying LHT discount:', error);
          // Don't fail the order if LHT discount fails - payment already succeeded
        }
      }

      // Tạo notification cho user
      try {
        await notificationService.createNotification(
          order.userid,
          `Thanh toán đơn hàng #${orderId} thành công! Bạn có thể bắt đầu học ngay.`
        );
      } catch (error) {
        console.error('Error creating payment success notification:', error);
      }
    }

    await t.commit();
    return order;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createOrderFromCart,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus
};