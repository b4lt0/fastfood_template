const Order = require('../models/Order');
const Cart = require("../models/Cart");
const User = require("../models/User");
const schedule = require('node-schedule');

/*
 //to reset order counter at midnight
    static globalResetJob = schedule.scheduleJob('0 0 * * *', () => {
        Counter.counter = 0;
    });
}*/

const createOrder = async (req, res) => {
    const token = req.cookies.jwt;
    const {cartId} = req.body;
    const orderLimit = 100;
    try {
        let cart = await Cart.findById(cartId);
        if (!cart) return res.status(404).json({'message': 'This cart does not exist'});

        const foundUser = await User.findOne({refreshToken: token}).exec();
        if (!foundUser) return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who are you?'});

        const latestOrder = await Order.findOne().sort({number: -1}).exec();
        let orderNumber = !latestOrder? 0 : latestOrder.number;
        orderNumber++;
        orderNumber = orderNumber>=orderLimit? 1 : orderNumber;

        const order = {
            customerId: foundUser.id,
            cartId: cart.id,
            number: orderNumber
        }

        const result = await Order.create(order);
        res.status(201).json(result);

    } catch (err) {
        return res.status(500).json({'message': "Ooops something went wrong: " + err.toString()});
    }
}

const getOrdersQueue = async (req, res) => {
    const orderQueue = await Order.find().sort({_id: 'asc'});
    if (!orderQueue) return res.status(204).json({'message': 'There\'s nothing here.'});
    res.json(orderQueue);
}

const getWaitingOrdersQueue = async (req, res) => {
    const filter = {status: 'waiting'}
    const orderQueue = await Order.find(filter).sort({_id: 'asc'});
    if (!orderQueue) return res.status(204).json({'message': 'There\'s nothing here.'});
    res.json(orderQueue);
}

const handleSSE = async (req, res) => {
    const eventListener = require('./commonEventEmitter').commonEmitter;

    //res.status(200);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    eventListener.on('cooking', function (msg) {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
    });

    eventListener.on('ready', function (msg) {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
        res.end();
    });
}

const openOrderFromQueue = async (req, res) => {
    const token = req.cookies.jwt;
    const {orderId} = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({'message': 'This order does not exist'});

        const foundChef = await User.findOne({refreshToken: token}).exec();
        if (!foundChef) return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who are you?'});

        await Order.updateOne({_id: orderId}, {'chefId': foundChef.id, 'status': 'cooking'}).exec();

        const populatedOrder = await Order.findById(orderId).populate({
            path: 'cartId',
            model: Cart,
            populate: {
                path: 'items.productId',
                model: 'Product'
            }
        });

        res.status(200).json(populatedOrder);

    } catch (err) {
        return res.status(500).json({'message': "Ooops something went wrong: " + err.toString()});
    }
}

const closeOrderFromQueue = async (req, res) => {
    const token = req.cookies.jwt;
    const {orderId} = req.body;
    try {
        let order = await Order.findById(orderId);
        if (!order) return res.status(404).json({'message': 'This order does not exist'});

        const foundChef = await User.findOne({refreshToken: token}).exec();
        if (foundChef.id !== JSON.parse(JSON.stringify(order.chefId)))
            return res.status(403).json({'message': 'Mhhhh I see no one here with your token, who are you?'});

        await Order.updateOne({_id: orderId}, {'status': 'ready'}).exec();
        order = await Order.findById(orderId);

        res.status(200).json(order);

        schedule.scheduleJob('0 0 * * *', async () => {
            await Order.deleteOne({_id: order.id});
        });
    } catch (err) {
        return res.status(500).json({'message': "Ooops something went wrong: " + err.toString()});
    }
}

module.exports = {
    getWaitingOrdersQueue,
    closeOrderFromQueue,
    openOrderFromQueue,
    getOrdersQueue,
    createOrder,
    handleSSE
}
