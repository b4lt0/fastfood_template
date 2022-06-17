const User = require('../models/User');
const Product = require('../models/Product')
const mongoose = require("mongoose");

const getAllProducts = async (req, res) => {
    const products = await Product.find();
    if (!products) return res.status(204).json({'message': 'There\'s nothing here.'});
    res.json(products);
}

const deleteProduct = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": 'We need the product ID to delete it'});
    const product = await Product.findOne({_id: req.body.id}).exec();
    if (!product) {
        return res.status(204).json({'message': `There's nothing with id:${req.body.id}`});
    }
    const result = await product.deleteOne({_id: req.body.id});
    res.json(result);
}

const getProduct = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({"message": 'We need the product ID to get it'});
    const product = await Product.findOne({_id: req.params.id}).exec();
    if (!product) {
        return res.status(204).json({'message': `There's nothing with id:${req.params.id}`});
    }
    res.json(product);
}

const createProduct = async (req, res) => {
    //TODO check other required (see auth)
    if (!req?.body?.name)
        return res.status(400)
            .json({"message": 'We need all the info to create a product.'});

    //this awful sequence of .then has been done on purpose to better understand how this statement works
    let product;
    await Product.findOne({name: req.body.name})
        .then((p) => product = p)
        .then((product) => {
            if (product)
                return res.status(204)
                    .json({'message': `This product already exists:${req.body.name}`});
        })
        .then(() => {
            Product.create({...req.body})
                .then(() => res.status(200).json({'message': 'Product created correctly!'}));
        })
        .catch((e) => res.status(500).json({'error': 'Oops something happened: ' + e.toString()}));
}

const updateProduct = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": 'We need the product ID to update it'});
    //TODO check if other params have been sent, if not there's nothing to update
    const product = await Product.findOne({_id: req.body.id}).exec();
    if (!product) return res.status(204).json({'message': `There's nothing with id:${req.body.id}`});

    const filter = {id: req.body.id};
    const update = {...req.body};

    // [mongoose doc] `doc` is the document _before_ `update` was applied
    await Product.findOneAndUpdate(filter, update)
        .then((product) => {
            return Product.findOne(filter)
        })
        .then((item) => res.status(200).json(item))
        .catch((e) => res.status(409).json({'error': 'Oops failed update: ' + e.toString()}));
}

module.exports = {
    createProduct,
    updateProduct,
    getAllProducts,
    deleteProduct,
    getProduct
}