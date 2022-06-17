const Cart = require('../models/Cart');
//const jwt = require("jsonwebtoken");
const User = require("../models/User");

const addItemToCart = async (req, res) => {
    const token = req.cookies.jwt;
    // TODO check if valid
    const {productId, quantity} = req.body;

    // [alternative 1] search the user by token (simplest)
    const foundUser = await User.findOne({refreshToken: token}).exec();
    // [alternative 2] We could verify the token, decode the username and find the id searching by username
    // [alternative 3] Otherwise we could sign the token with the id then just verify the token and decode the id

    if (!foundUser) return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who tf are you?'}); //tf sta per tensorflow :)

    try {
        let cart = await Cart.findOne({userId: foundUser.id});
        // if cart exists for user
        if (cart) {
            // check if the products is already in the cart...
            let index = cart.products.findIndex(p => p.productId === productId);
            if (index > -1) {
                //...then update the quantity
                let item = cart.products[index];
                item.quantity += quantity;
                cart.products[index] = item;
            } else {
                //product does not exists in cart, then add new item
                cart.products.push({productId, quantity});
            }
            cart = await cart.save();
            return res.status(201).json(cart);
        } else {
            //no cart for user, create new cart
            const newCart = await Cart.create({
                userId: foundUser.id,
                productItem: [{productId, quantity}]
            });

            return res.status(201).json(newCart);
        }
    } catch (err) {
        res.status(500).json({"message": "Ooops something went wrong: " + err.toString()});
    }
}

const deleteFromCart = async (req, res) => {
    const token = req.cookies.jwt;
    // TODO check if valid
    const productId = req.body.id;

    const foundUser = await User.findOne({refreshToken: token}).exec();

    if (!foundUser) return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who tf are you?'});

    try {
        let cart = await Cart.findOne({userId: foundUser.id});
        // if cart exists for user
        if (cart) {
            // check if the products is already in the cart...
            let index = cart.products.findIndex(p => p.productId === productId);
            if (index > -1) {
                //...then update the quantity
                let item = cart.products[index];
                item.quantity--;
                cart.products[index] = item;
            } else {
                //product does not exists in cart, then return error
                return res.status(409).json({'message': 'This product is not in the cart. What do you want to remove?'});
            }
            cart = await cart.save();
            return res.status(201).json(cart);
        } else {
            //no cart for user
            return res.status(409).json({'message': 'There is no cart for the user'});
        }
    } catch (err) {
        res.status(500).json({"message": "Ooops something went wrong: " + err.toString()});
    }
}

module.exports = {
    addItemToCart,
    deleteFromCart
}
