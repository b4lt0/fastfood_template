const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
        },
        subTotal: Number
    },
    {timestamps: true})

module.exports = mongoose.model('transaction', transactionSchema);