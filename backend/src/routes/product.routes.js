const express = require('express');
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, authorize('Admin'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('Admin'), updateProduct)
    .delete(protect, authorize('Admin'), deleteProduct);

module.exports = router;
