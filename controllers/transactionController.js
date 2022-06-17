const User = require("../models/User");
const Cart = require("../models/Cart");
const Transaction = require("../models/Transaction")
const Product = require("../models/Product");


const pay = async (req, res) => {
    const token = req.cookies.jwt;
    const cartId = req.body.cartId;
    try {
        const foundUser = await User.findOne({refreshToken: token}).exec();
        if (!foundUser) return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who are you?'});

        const cart = await Cart.findById(cartId);
        if (!cart) return res.status(404).json({'message': 'This cart does not exist.'});

        const transaction = {
            user: foundUser.id,
            cart: cartId,
            subTotal: cart.subTotal
        }

        const result = await Transaction.create(transaction);
        res.status(201).json(result);
    }catch (err) {
        return res.status(500).json({'message': "Ooops something went wrong: "+err.toString()});
    }
}

const getTransactions = async (req, res) => {
    const transactions = await Transaction.find();
    if (!transactions) return res.status(204).json({'message': 'There\'s nothing here.'});
    res.json(transactions);
}

const deleteTransaction = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": 'We need the transaction ID to delete it'});
    const transaction = await Transaction.findOne({_id: req.body.id}).exec();
    if (!transaction) {
        return res.status(204).json({'message': `There's nothing with id:${req.body.id}`});
    }
    const result = await transaction.deleteOne({_id: req.body.id});
    res.json(result);
}

module.exports = {
    pay,
    getTransactions,
    deleteTransaction
}