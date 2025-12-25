const Product = require('../models/Product');

// @desc    Create a product
// @route   POST /products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            object: product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            object: product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all products (with pagination and search)
// @route   GET /products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            object: products,
            pageNumber: page,
            pageSize: limit,
            totalSize: totalProducts,
            totalPages: totalPages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            object: product
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
