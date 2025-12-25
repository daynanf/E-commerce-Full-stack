const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        minlength: [10, 'Description must be at least 10 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0.01, 'Price must be positive']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Stock must be an integer'
        }
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional: if we want to track who created it
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
