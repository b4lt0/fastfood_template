const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

const populateCart = async (id) => {
    return Cart.find({userId: id}).populate({
        path: "items.productId",
        select: "name price total"
    });
};

const addItem = async (payload) => {
    return await Cart.create(payload);
}

const addItemToCart = async (req, res) => {
    const token = req.cookies.jwt;
    const {productId, quantity} = req.body;

    try {
        const foundUser = await User.findOne({refreshToken: token}).exec();
        if (!foundUser) return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who are you?'});

        // Populate the cart with the referred products
        let cart = await populateCart(foundUser.id);
        // Look for the Product we want to add and return error if missing
        let productDetails = await Product.findById(productId);
        if (!productDetails) return res.status(404).json({'message': 'This product does not exist'});

        if (cart.length) {
            // Get the index in the items array if the product is already in the cart, otherwise -1
            const indexFound = cart.items.findIndex(item => item.productId.id === productId);
            //If previous returns valid index and quantity was set to <=0 in req...
            if (indexFound !== -1 && quantity <= 0) {
                //... we delete that product (as a deleteFromCart method)...
                cart.items.splice(indexFound, 1);
                //... and update subtotal.
                if (cart.items.length === 0) {
                    cart.subTotal = 0;
                } else {
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
            }
            // If the index was valid and quantity was not meant to delete product (>0), we add it
            else if (indexFound !== -1) {
                cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
                cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
                cart.items[indexFound].price = productDetails.price
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            // If the quantity was positive but the product wasn't in db then we push it into the json array
            else if (quantity > 0) {
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: productDetails.price,
                    total: parseFloat(productDetails.price * quantity)
                })
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            // This is if we didn't receive the correct values in req
            else {
                return res.status(400).json({'message': "Invalid request"})
            }
            // Save everything done so far
            let newCart = await cart.save();
            return res.status(201).json(newCart)
        }
        // If there is no user with a cart it creates a new cart and then adds the item to the newly created cart
        else {
            const cartData = {
                userId: foundUser.id,
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseFloat(productDetails.price * quantity),
                    price: productDetails.price
                }],
                subTotal: parseFloat(productDetails.price * quantity)
            }
            cart = await addItem(cartData);
            res.json(cart);
        }
    } catch (err) {
        return res.status(500).json({'message': "Ooops something went wrong: "+err.toString()});
    }
}


const getCart = async (req, res) => {
    try {
        let cart = await populateCart();
        if (!cart) {
            return res.status(404).json({'message': "There's no cart here."})
        }
        res.status(200).json({cart})
    } catch (err) {
        res.status(500).json({'message': "Ooops something went wrong: "+err.toString()});
    }
}

module.exports = {
    getCart,
    addItemToCart
}
