const express = require('express');
const { placeOrder, getMyOrders } = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // All order routes are protected

router.route('/')
    .post(placeOrder)
    .get(getMyOrders);

module.exports = router;
