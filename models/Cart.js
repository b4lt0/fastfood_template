const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
})

const cartSchema = new Schema({
        items: [itemSchema],
        subTotal: Number
    },
    {timestamps: true})

module.exports = mongoose.model('cart', cartSchema);