const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Place a new order
// @route   POST /orders
// @access  Private
exports.placeOrder = async (req, res) => {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { products } = req.body; // Expects [{ productId, quantity }]

        if (!products || products.length === 0) {
            return res.status(400).json({ success: false, message: 'No products in order' });
        }

        let orderItems = [];
        let totalPrice = 0;

        for (const item of products) {
            const product = await Product.findById(item.productId).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save({ session });

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            totalPrice += product.price * item.quantity;
        }

        const order = await Order.create([{
            user: req.user.id,
            products: orderItems,
            totalPrice,
            status: 'pending'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            object: order[0]
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // Check for custom errors thrown above
        if (error.message.includes('Insufficient stock') || error.message.includes('Product not found')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            object: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
