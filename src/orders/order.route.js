const express = require('express');
const { makePaymentRequest, confirmPayment, getOrdersByEmail, getOrdersByOrderId, getAllOrders, updateOrderStatus, deleteOrderById } = require('./order.controller');

const router = express.Router();

// create checkout session
router.post('/create-checkout-session', makePaymentRequest);

// confirm payment
router.post("/confirm-payment", confirmPayment);

// get orders by email address
router.get('/:email', getOrdersByEmail);

// get orders by orderId
router.get('/order/:id', getOrdersByOrderId);

// get all orders (admin only)
router.get('/', getAllOrders);

// update order status (admin only)
router.patch("/update-order-status/:id", updateOrderStatus);

// delete order (admin only)
router.delete("/delete-order/:id", deleteOrderById);

module.exports = router;