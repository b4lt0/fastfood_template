const Cart = require("../models/Cart");
const Product = require("../models/Product");

const populateCart = async () => {
    const carts = await Cart.find().populate({
        path: "items.productId",
        select: "name price total"
    });
    return carts[0];
};

const addItem = async (payload) => {
    return await Cart.create(payload);
}

const addItemToCart = async (req, res) => {
    const {productId, quantity} = req.body;

    try {
        let cart = await populateCart();
        let productDetails = await Product.findById(productId);
        if (!productDetails) {
            return res.status(404).json({'message': 'This product does not exist'});
        }
        //--If Cart Exists ----
        if (cart) {
            //---- check if index exists ----
            const indexFound = cart.items.findIndex(item => item.productId.id === productId);
            //------this removes an item from the cart if the quantity is set to zero,We can use this method to remove an item from the list  -------
            if (indexFound !== -1 && quantity <= 0) {
                cart.items.splice(indexFound, 1);
                if (cart.items.length === 0) {
                    cart.subTotal = 0;
                } else {
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
            }
            //----------check if product exist,just add the previous quantity with the new quantity and update the total price-------
            else if (indexFound !== -1) {
                cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
                cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
                cart.items[indexFound].price = productDetails.price
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //----Check if Quantity is Greater than 0 then add item to items Array ----
            else if (quantity > 0) {
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: productDetails.price,
                    total: parseInt(productDetails.price * quantity)
                })
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //----if quantity or price is 0 throw the error -------
            else {
                return res.status(400).json({'message': "Invalid request"})
            }
            let newCart = await cart.save();
            return res.status(201).json(newCart)
        }
        //------------ if there is no user with a cart...it creates a new cart and then adds the item to the cart that has been created------------
        else {
            const cartData = {
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseInt(productDetails.price * quantity),
                    price: productDetails.price
                }],
                subTotal: parseInt(productDetails.price * quantity)
            }
            cart = await addItem(cartData)
            // let data = await cart.save();
            res.json(cart);
        }
    } catch (err) {
        return res.status(500).json({'message': "Ooops something went wrong "+err.toString()});
    }
}

const getCart = async (req, res) => {
    try {
        let cart = await populateCart();
        if (!cart) {
            return res.status(400).json({
                type: "Invalid",
                msg: "Cart Not Found",
            })
        }
        res.status(200).json({
            status: true,
            data: cart
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something Went Wrong",
            err: err
        })
    }
}

module.exports = {
    getCart,
    addItemToCart
}
